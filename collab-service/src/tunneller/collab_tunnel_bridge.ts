import { ServerDuplexStream } from '@grpc/grpc-js';
import { RedisClientType } from 'redis';
import { CollabTunnelRequest, CollabTunnelResponse } from '../proto/collab-service';
import { TunnelPubSub } from '../redis_adapter/redis_pubsub_types';
import {
  ConnectionOpCode,
  TunnelMessage,
} from '../message_handler/internal/internal_message_types';
import IAttemptCache from '../history_handler/attempt_cache_types';
import { IQuestionAgent } from '../question_client/question_agent_types';
import Logger from '../utils/logger';
import {
  createAckMessage, createDataMessage, createDiscoverMessage,
  createHelloMessage,
} from '../message_handler/internal/internal_message_builder';
import { isHeartbeat, makeDataResponse } from '../message_handler/room/response_message_builder';
import {
  createExecuteCompletePackage,
  createExecutePendingPackage,
  createQuestionRcvPackage,
  createSaveCodeAckPackage,
  createSaveCodeFailedPackage,
  OPCODE_EXECUTE_REQ,
  OPCODE_QUESTION_REQ,
  OPCODE_SAVE_CODE_REQ,
  readConnectionOpCode,
} from '../message_handler/room/connect_message_builder';
import { getQuestionRedis, setQuestionRedis } from '../redis_adapter/redis_question_adapter';
import { createAttemptCache } from '../history_handler/attempt_cache';
import { deserializeQuestion } from '../question_client/question_serializer';
import ExecuteBridge from '../executor_handler/execute_controller';

const SUBMISSION_WAIT = 4 * 1000;

class CollabTunnelBridge {
  call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>;

  pubsub: TunnelPubSub<TunnelMessage>;

  redis: RedisClientType;

  attemptCache: IAttemptCache;

  questionAgent: IQuestionAgent;

  historyAgent: IHistoryAgent;

  executeAgent: IExecuteAgent;

  username: string;

  nickname: string;

  roomId: string;

  questionId: number | undefined;

  constructor(
    call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
    pubsub: TunnelPubSub<TunnelMessage>,
    redis: RedisClientType,
    questionAgent: IQuestionAgent,
    historyAgent: IHistoryAgent,
    executeAgent: IExecuteAgent,
    username: string,
    nickname: string,
    roomId: string,
  ) {
    this.call = call;
    this.pubsub = pubsub;
    this.redis = redis;
    this.attemptCache = createAttemptCache();
    this.questionAgent = questionAgent;
    this.historyAgent = historyAgent;
    this.executeAgent = executeAgent;
    this.username = username;
    this.nickname = nickname;
    this.roomId = roomId;
  }

  /**
   * Handles subscribed message received from pubsub
   * @param message
   */
  async handleRedisMessages(message: TunnelMessage) {
    const { sender } = message;
    let dataToSend = message.data;
    // Ignore self-echo
    if (sender === this.username) {
      return;
    }
    // Handle internal redis message cases
    switch (message.flag) {
      case ConnectionOpCode.DATA: // Receive normal, Do nothing
        break;

      case ConnectionOpCode.JOIN: // Receive A, Send B
        Logger.info(`${this.username} received JOIN from ${sender}`);
        await this.pubsub.pushMessage(createAckMessage(this.username, this.nickname));
        break;

      case ConnectionOpCode.ACK: // Receive B, 'Connected'
        Logger.info(`${this.username} received ACK from ${sender}`);
        break;

      case ConnectionOpCode.ROOM_DISCOVER: // Receive ARP discovery, Send 'Who Am I'
        Logger.info(`${this.username} received ARP from ${sender}`);
        await this.pubsub.pushMessage(createHelloMessage(this.username));
        break;

      case ConnectionOpCode.ROOM_HELLO: // Receive 'Who Am I', Save attempt
        Logger.info(`${this.username} received WMI from ${sender}`);
        // Complete saving snapshot
        this.attemptCache.setUsers([this.username, sender]);
        dataToSend = await this.saveAttempt();
        await this.pubsub.pushMessage(createDataMessage(this.username, dataToSend));
        break;

      default:
        Logger.error('Unknown connection flag');
        return;
    }
    this.call.write(makeDataResponse(dataToSend));
  }

  /**
   * Handles connection messages from client
   * @param request
   */
  async handleClientMessage(request: CollabTunnelRequest) {
    // Ignore heartbeat
    if (isHeartbeat(request.flags)) {
      return;
    }
    // Handle external client message cases
    switch (readConnectionOpCode(request.data)) {
      case OPCODE_QUESTION_REQ: // Retrieve question, send question back to user
        Logger.info(`${this.username} requested for question`);
        await this.handleRetrieveQuestionRequest();
        break;

      case OPCODE_SAVE_CODE_REQ: // Snapshot code
        Logger.info(`${this.username} requested for saving code`);
        await this.handleSaveHistoryRequest(request);
        break;

      case OPCODE_EXECUTE_REQ: // Execute code
        Logger.info(`${this.username} requested for executing code`);
        await this.handleExecuteCodeRequest(request);
        break;

      default: // Normal data, push to publisher
        await this.pubsub.pushMessage(createDataMessage(this.username, request.data));
    }
  }

  /**
   * Handles connection messages: save code request, from client
   * @param request
   * @private
   */
  private async handleSaveHistoryRequest(request: CollabTunnelRequest) {
    // Prepare saving snapshot
    const questionResponse = await getQuestionRedis(this.roomId, this.redis);
    this.attemptCache.setQuestion(questionResponse);
    this.attemptCache.setLangContent(request.data);

    // Retrieve other user
    await this.pubsub.pushMessage(createDiscoverMessage(this.username));

    // Wait for other user response
    await new Promise((resolve) => {
      setTimeout(resolve, SUBMISSION_WAIT);
    });
    // If no response, start individual submission
    if (!this.attemptCache.isEmpty()) {
      this.attemptCache.setUsers([this.username]);
      const dataToSend = await this.saveAttempt();
      this.call.write(makeDataResponse(dataToSend));
    }
  }

  /**
   * Generates random difficulty question and stores in Redis
   * @param difficulty
   */
  async generateQuestion(difficulty: number) {
    const question = await this.questionAgent.getQuestionByDifficulty(difficulty);
    if (question === undefined) {
      Logger.error(`No question of ${difficulty} was found`);
      return;
    }
    await setQuestionRedis(this.roomId, question, this.redis);
    await this.handleRetrieveQuestionRequest();
  }

  /**
   * Retrieves stored question and writes to client
   * @private
   */
  private async handleRetrieveQuestionRequest() {
    const finalQuestion = await getQuestionRedis(this.roomId, this.redis);
    const qns = deserializeQuestion(finalQuestion);
    if (!qns) {
      return;
    }
    this.questionId = qns.questionId;
    let isCompleted = false;
    if (this.questionId) {
      isCompleted = await this.historyAgent.getHasBeenCompleted(this.username, this.questionId);
    }
    this.call.write(makeDataResponse(createQuestionRcvPackage(finalQuestion, isCompleted)));
  }

  /**
   * Saves attempt to history.
   * @private
   */
  private async saveAttempt(): Promise<Uint8Array> {
    // Complete saving snapshot
    if (!this.attemptCache.isValid()) {
      Logger.error('Attempt is not valid');
      return createSaveCodeFailedPackage();
    }
    const attempt = await this.attemptCache.getHistoryAttempt();
    const message = await this.historyAgent.uploadHistoryAttempt(attempt);
    if (message) {
      Logger.error(`Attempt: ${message}`);
    }
    return createSaveCodeAckPackage(message);
  }

  /**
   * Executes code.
   * @private
   */
  private async handleExecuteCodeRequest(request: CollabTunnelRequest) {
    if (!this.questionId) {
      return;
    }
    // Notify self & other user
    const pendingData = createExecutePendingPackage();
    await this.pubsub.pushMessage(createDataMessage(this.username, pendingData));
    this.call.write(makeDataResponse(pendingData));

    const question = await getQuestionRedis(this.roomId, this.redis);
    const qns = deserializeQuestion(question);
    if (!qns) {
      return;
    }
    const stdin = qns.executionInput;
    const runner = new ExecuteBridge(stdin, request.data, this.executeAgent);
    await runner.run(async (value: string) => {
      console.log(value);
      // Write to self & other user
      const completeData = createExecuteCompletePackage(value);
      await this.pubsub.pushMessage(createDataMessage(
        this.username,
        completeData,
      ));
      this.call.write(makeDataResponse(completeData));
    });
  }
}

export default function createCollabTunnelBridge(
  call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
  pubsub: TunnelPubSub<TunnelMessage>,
  redis: RedisClientType,
  questionAgent: IQuestionAgent,
  historyAgent: IHistoryAgent,
  executeAgent: IExecuteAgent,
  username: string,
  nickname: string,
  roomId: string,
): CollabTunnelBridge {
  return new CollabTunnelBridge(
    call,
    pubsub,
    redis,
    questionAgent,
    historyAgent,
    executeAgent,
    username,
    nickname,
    roomId,
  );
}
