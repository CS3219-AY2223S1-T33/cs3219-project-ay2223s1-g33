import { Metadata, ServerDuplexStream } from '@grpc/grpc-js';
import { createClient, RedisClientType } from 'redis';
import {
  createAckMessage, createJoinMessage, createDataMessage,
  createDiscoverMessage, createHelloMessage,
} from '../message_handler/internal/internal_message_builder';
import {
  createDisconnectedPackage, createQuestionRcvPackage, readConnectionOpCode,
  OPCODE_QUESTION_REQ, OPCODE_SAVE_CODE_REQ, createSaveCodeAckPackage, createSaveCodeFailedPackage,
} from '../message_handler/room/connect_message_builder';
import {
  makeUnauthorizedResponse, makeDataResponse,
  makeHeartbeatResponse, isHeartbeat,
} from '../message_handler/room/response_message_builder';
import { createRedisPubSubAdapter, TunnelPubSub } from '../redis_adapter/redis_pubsub_adapter';
import {
  createRedisTopicPool,
  RedisTopicPool,
} from '../redis_adapter/redis_topic_pool';
import createRoomSessionService from '../room_auth/room_session_agent';
import createQuestionService from '../question_client/question_agent';
import {
  getQuestionRedis, heartbeatQuestionRedis,
  setQuestionRedis,
} from '../redis_adapter/redis_question_adapter';
import CollabTunnelSerializer from './collab_tunnel_serializer';
import {
  CollabTunnelRequest,
  CollabTunnelResponse,
} from '../proto/collab-service';
import { IRoomSessionAgent } from '../room_auth/room_session_agent_types';
import { IQuestionAgent } from '../question_client/question_agent_types';
import {
  ConnectionOpCode,
  TunnelMessage,
} from '../message_handler/internal/internal_message_types';
import Logger from '../utils/logger';
import { IHistoryAgent } from '../history_client/history_agent_types';
import createHistoryService from '../history_client/history_agent';
import { CreateAttemptResponse } from '../proto/history-crud-service';
import IAttemptCache from '../history_handler/attempt_cache_types';
import { createAttemptCache } from '../history_handler/attempt_cache';
import { HistoryAttempt } from '../proto/types';

const PROXY_HEADER_USERNAME = 'X-Gateway-Proxy-Username';
const PROXY_HEADER_NICKNAME = 'X-Gateway-Proxy-Nickname';
const PROXY_HEADER_ROOM_TOKEN = 'X-Gateway-Proxy-Room-Token';
const HEARTBEAT_INTERVAL = 20000;
const SUBMISSION_WAIT = 4 * 1000;

class CollabTunnelController {
  pub: RedisClientType;

  topicPool: RedisTopicPool;

  roomTokenAgent: IRoomSessionAgent;

  questionAgent: IQuestionAgent;

  historyAgent: IHistoryAgent;

  constructor(redisUrl: string, questionUrl: string, historyUrl: string, roomSecret: string) {
    this.roomTokenAgent = createRoomSessionService(roomSecret);
    this.pub = createClient({
      url: redisUrl,
    });

    const sub: RedisClientType = createClient({
      url: redisUrl,
    });

    this.pub.connect();
    sub.connect();

    this.topicPool = createRedisTopicPool(sub);

    this.questionAgent = createQuestionService(questionUrl);

    this.historyAgent = createHistoryService(historyUrl);
  }

  /**
   * Handles client stream, when it opens, closes and has data sent over
   * @param call
   */
  async handleOpenStream(
    call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
  ) {
    // When stream opens
    const {
      roomToken,
      username,
      nickname,
    } = CollabTunnelController.extractMetadata(call.metadata);

    const data = await this.roomTokenAgent.verifyToken(roomToken);
    if (!data) {
      // Kill stream when invalid room
      call.write(makeUnauthorizedResponse());
      call.end();
      return;
    }
    const {
      roomId,
      difficulty,
    } = data;

    const redisPubSubAdapter = createRedisPubSubAdapter(
      this.pub,
      this.topicPool,
      username,
      roomId,
      new CollabTunnelSerializer(),
    );

    const attemptCache = createAttemptCache();

    await redisPubSubAdapter.addOnMessageListener(
      CollabTunnelController.createCallWriter(
        call,
        redisPubSubAdapter,
        attemptCache,
        username,
        nickname,
      ),
    );

    // Connection discovery, Send A
    await redisPubSubAdapter.pushMessage(createJoinMessage(username, nickname));

    // Retrieve and send question
    this.handleQuestion(difficulty, roomId, call);

    // Upkeep gateway connection & question in redis
    const heartbeatWorker = setInterval(() => {
      call.write(makeHeartbeatResponse());
      heartbeatQuestionRedis(roomId, this.pub);
    }, HEARTBEAT_INTERVAL);

    // When data is detected
    call.on('data', (request: CollabTunnelRequest) => {
      this.handleIncomingData(call, redisPubSubAdapter, attemptCache, username, roomId, request);
    });

    // When stream closes
    call.on('end', () => {
      clearInterval(heartbeatWorker);

      // Send 'Disconnected'
      redisPubSubAdapter.pushMessage(
        createDataMessage(username, createDisconnectedPackage(nickname)),
      );

      const endFunc = () => call.end();
      redisPubSubAdapter.clean(endFunc);
    });
  }

  /**
   * Handles subscribed message received from pubsub
   * @param call
   * @param pubsub
   * @param attemptCache
   * @param message
   * @param username
   * @param nickname
   */
  static async handleWrite(
    call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
    pubsub: TunnelPubSub<TunnelMessage>,
    attemptCache: IAttemptCache,
    message: TunnelMessage,
    username: string,
    nickname: string,
  ) {
    // Prevent self echo
    if (message.sender === username) {
      return;
    }
    // Handle internal message cases;
    let dataToSend = message.data;
    switch (message.flag) {
      case ConnectionOpCode.DATA: // Receive normal, Do nothing
        break;
      case ConnectionOpCode.JOIN: // Receive A, Send B
        Logger.info(`${username} received JOIN from ${message.sender}`);
        await pubsub.pushMessage(createAckMessage(username, nickname));
        break;
      case ConnectionOpCode.ACK: // Receive B, 'Connected'
        Logger.info(`${username} received ACK from ${message.sender}`);
        break;
      case ConnectionOpCode.ROOM_DISCOVER: // Receive ARP discovery, Send 'Who Am I'
        Logger.info(`${username} received ARP from ${message.sender}`);
        await pubsub.pushMessage(createHelloMessage(username));
        break;
      case ConnectionOpCode.ROOM_HELLO: // Receive 'Who Am I', Save attempt
        Logger.info(`${username} received WMI from ${message.sender}`);
        // Complete saving snapshot
        attemptCache.setUsers([username, message.sender]);
        dataToSend = await this.saveAttempt(attemptCache);
        await pubsub.pushMessage(createDataMessage(username, dataToSend));
        break;
      default:
        Logger.error('Unknown connection flag');
        return;
    }
    call.write(makeDataResponse(dataToSend));
  }

  /**
   * Creates encapsulated lambda for writing subscribed data to client
   * @param call
   * @param pubsub
   * @param attemptCache
   * @param username
   * @param nickname
   */
  static createCallWriter(
    call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
    pubsub: TunnelPubSub<TunnelMessage>,
    attemptCache: IAttemptCache,
    username: string,
    nickname: string,
  ): (data: TunnelMessage) => void {
    return async (message: TunnelMessage): Promise<void> => {
      await CollabTunnelController.handleWrite(
        call,
        pubsub,
        attemptCache,
        message,
        username,
        nickname,
      );
    };
  }

  /**
   * Handles question retrieval from client & saves unto Redis
   * @param difficulty
   * @param roomId
   * @param call
   * @private
   */
  private async handleQuestion(
    difficulty: number,
    roomId: string,
    call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
  ) {
    const questionResponse = await this.questionAgent.getQuestionByDifficulty(difficulty);
    if (questionResponse.errorMessage || questionResponse.question === undefined) {
      Logger.error(`Question: ${questionResponse.errorMessage}`);
      return;
    }
    await setQuestionRedis(roomId, questionResponse.question, this.pub);
    await this.sendQuestionFromRedis(roomId, call);
  }

  /**
   * Creates and sends question stored in Redis to client
   * @param roomId
   * @param call
   * @private
   */
  private async sendQuestionFromRedis(
    roomId: string,
    call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
  ) {
    const finalQuestion = await getQuestionRedis(roomId, this.pub);
    call.write(makeDataResponse(createQuestionRcvPackage(finalQuestion)));
  }

  /**
   * Handles data package sent by client based on package opcode received
   * @param username
   * @param roomId
   * @param request
   * @param call
   * @param pubsub
   * @param attemptCache
   */
  async handleIncomingData(
    call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
    pubsub: TunnelPubSub<TunnelMessage>,
    attemptCache: IAttemptCache,
    username: string,
    roomId: string,
    request: CollabTunnelRequest,
  ) {
    // Ignore heartbeat
    if (isHeartbeat(request.flags)) {
      return;
    }
    // Handle external connection message cases
    switch (readConnectionOpCode(request.data)) {
      case OPCODE_QUESTION_REQ: // Retrieve question, send back to user
        Logger.info(`${username} requested for question`);
        await this.sendQuestionFromRedis(roomId, call);
        break;
      case OPCODE_SAVE_CODE_REQ: // Snapshot code
        Logger.info(`${username} requested for saving code`);
        await this.handleIncomingSaveRequest(roomId, attemptCache, request, pubsub, username, call);
        break;
      default: // Normal data, push to publisher
        await pubsub.pushMessage(createDataMessage(username, request.data));
    }
  }

  /**
   * Handles save code request by client
   * @param roomId
   * @param attemptCache
   * @param request
   * @param pubsub
   * @param username
   * @param call
   * @private
   */
  private async handleIncomingSaveRequest(
    roomId: string,
    attemptCache: IAttemptCache,
    request: CollabTunnelRequest,
    pubsub: TunnelPubSub<TunnelMessage>,
    username: string,
    call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
  ) {
    // Prepare saving snapshot
    const questionResponse = await getQuestionRedis(roomId, this.pub);
    attemptCache.setQuestion(questionResponse);
    attemptCache.setLangContent(request.data);
    attemptCache.setUploader(this.createUploader());

    // Retrieve other user
    await pubsub.pushMessage(createDiscoverMessage(username));

    // Wait for other user response
    await new Promise((resolve) => {
      setTimeout(resolve, SUBMISSION_WAIT);
    });
    // If no response, start individual submission
    if (!attemptCache.isEmpty()) {
      attemptCache.setUsers([username]);
      const dataToSend = await CollabTunnelController.saveAttempt(attemptCache);
      call.write(makeDataResponse(dataToSend));
    }
  }

  /**
   * Creates encapsulated lambda for uploading an attempt to client
   */
  createUploader() {
    return async (attempt: HistoryAttempt): Promise<CreateAttemptResponse> => {
      const res = await this.historyAgent.uploadHistoryAttempt(attempt);
      if (res.errorMessage) {
        Logger.error(res.errorMessage);
      }
      // Returns attempt response
      return res;
    };
  }

  /**
   * Saves attempt to history.
   * @param attemptCache Current cache of attempt
   * @return response package
   */
  static async saveAttempt(
    attemptCache: IAttemptCache,
  ): Promise<Uint8Array> {
    // Complete saving snapshot
    if (!attemptCache.isValid()) {
      Logger.error('Attempt is not valid');
      return createSaveCodeFailedPackage();
    }
    const attemptResponse = await attemptCache.executeUploader();
    if (attemptResponse.errorMessage) {
      Logger.error(`Attempt: ${attemptResponse.errorMessage}`);
    }
    return createSaveCodeAckPackage(attemptResponse.errorMessage);
  }

  /**
   * Extracts room token, username and nickname of user from metadata
   * @param data
   * @return tuple of  room token, username and nickname
   */
  static extractMetadata(
    data: Metadata,
  ) {
    const roomToken: string = data.get(PROXY_HEADER_ROOM_TOKEN)[0].toString();
    const username: string = data.get(PROXY_HEADER_USERNAME)[0].toString();
    const nickname: string = data.get(PROXY_HEADER_NICKNAME)[0].toString();
    return {
      roomToken,
      username,
      nickname,
    };
  }
}

function createCollabTunnelController(
  redisUrl: string,
  questionUrl: string,
  historyUrl: string,
  roomSecret: string,
): CollabTunnelController {
  return new CollabTunnelController(redisUrl, questionUrl, historyUrl, roomSecret);
}

export {
  CollabTunnelController,
  createCollabTunnelController,
};
