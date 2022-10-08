import { Metadata, ServerDuplexStream } from '@grpc/grpc-js';
import { createClient, RedisClientType } from 'redis';
import {
  createAckMessage,
  createDataMessage, createDiscoverMessage, createHelloMessage,
  createJoinMessage,
} from '../message_handler/internal/internal_message_builder';
import {
  createDisconnectedPackage,
  createQuestionRcvPackage,
  readConnectionOpCode,
  OPCODE_QUESTION_REQ, OPCODE_SAVE_CODE_REQ,
} from '../message_handler/room/connect_message_builder';
import {
  makeUnauthorizedResponse,
  makeDataResponse,
  makeHeartbeatResponse,
  isHeartbeat,
} from '../message_handler/room/response_message_builder';
import { createRedisPubSubAdapter, TunnelPubSub } from '../redis_adapter/redis_pubsub_adapter';
import { createRedisTopicPool, RedisTopicPool } from '../redis_adapter/redis_topic_pool';
import createRoomSessionService from '../room_auth/room_session_agent';
import createQuestionService from '../question_client/question_agent';
import {
  getQuestionRedis,
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
import HistoryBuilder from '../history_handler/history_builder';

const PROXY_HEADER_USERNAME = 'X-Gateway-Proxy-Username';
const PROXY_HEADER_NICKNAME = 'X-Gateway-Proxy-Nickname';
const PROXY_HEADER_ROOM_TOKEN = 'X-Gateway-Proxy-Room-Token';
const HEARTBEAT_INTERVAL = 20000;

class CollabTunnelController {
  pub: RedisClientType;

  topicPool: RedisTopicPool;

  roomTokenAgent: IRoomSessionAgent;

  questionAgent: IQuestionAgent;

  historyAgent: IHistoryAgent;

  historyBuilder: HistoryBuilder;

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

    this.historyBuilder = new HistoryBuilder();
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

    await redisPubSubAdapter.addOnMessageListener(
      CollabTunnelController.createCallWriter(
        call,
        redisPubSubAdapter,
        username,
        nickname,
        this.historyBuilder,
        this.historyAgent,
      ),
    );

    // Connection discovery, Send A
    await redisPubSubAdapter.pushMessage(createJoinMessage(username, nickname));

    // Retrieve and send question
    this.handleQuestion(difficulty, roomId, call);

    // Upkeep gateway connection
    const heartbeatWorker = setInterval(() => {
      call.write(makeHeartbeatResponse());
    }, HEARTBEAT_INTERVAL);

    // When data is detected
    call.on('data', (request: CollabTunnelRequest) => {
      this.handleIncomingData(username, roomId, request, call, redisPubSubAdapter);
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
   * @param message
   * @param username
   * @param nickname
   * @param call
   * @param pubsub
   * @param historyBuilder
   * @param historyAgent
   */
  static async handleWrite(
    message: TunnelMessage,
    username: string,
    nickname: string,
    call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
    pubsub: TunnelPubSub<TunnelMessage>,
    historyBuilder: HistoryBuilder,
    historyAgent: IHistoryAgent,
  ) {
    // Prevent self echo
    if (message.sender === username) {
      return;
    }
    // Handle internal message cases;
    let res: CreateAttemptResponse;
    switch (message.flag) {
      case ConnectionOpCode.DATA: // Receive normal, Do nothing
        break;
      case ConnectionOpCode.JOIN: // Receive A, Send B
        Logger.info(`${username} received JOIN from ${message.sender}`);
        await pubsub.pushMessage(createAckMessage(username, nickname));
        break;
      case ConnectionOpCode.ACK: // Receive B, Send 'Connected'
        Logger.info(`${username} received ACK from ${message.sender}`);
        break;
      case ConnectionOpCode.ROOM_DISCOVER: // Receive ARP discovery, Send 'Who Am I'
        Logger.info(`${username} received ARP from ${message.sender}`);
        await pubsub.pushMessage(createHelloMessage(username));
        break;
      case ConnectionOpCode.ROOM_HELLO: // Receive 'Who Am I', Save attempt
        Logger.info(`${username} received WMI from ${message.sender}`);
        historyBuilder.setUsers([username, message.sender]);
        res = await historyAgent.uploadHistoryAttempt(historyBuilder.buildHistoryAttempt());
        Logger.info(`Attempt was saved - ${!res.errorMessage}`);
        break;
      default:
        Logger.error('Unknown connection flag');
        return;
    }
    call.write(makeDataResponse(message.data));
  }

  /**
   * Creates encapsulated lambda for writing subscribed data to client
   * @param call
   * @param pubsub
   * @param username
   * @param nickname
   * @param historyBuilder
   * @param historyAgent
   */
  static createCallWriter(
    call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
    pubsub: TunnelPubSub<TunnelMessage>,
    username: string,
    nickname: string,
    historyBuilder: HistoryBuilder,
    historyAgent: IHistoryAgent,
  ): (data: TunnelMessage) => void {
    return async (message: TunnelMessage): Promise<void> => {
      await CollabTunnelController.handleWrite(
        message,
        username,
        nickname,
        call,
        pubsub,
        historyBuilder,
        historyAgent,
      );
    };
  }

  /**
   * Handles question retrieval from client & saves unto Redis
   * @param difficulty
   * @param roomId
   * @param call
   */
  async handleQuestion(
    difficulty: number,
    roomId: string,
    call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
  ) {
    const question = await this.questionAgent.getQuestionByDifficulty(difficulty);
    if (question === undefined) {
      Logger.error(`No question of difficulty ${difficulty} found`);
      return;
    }
    await setQuestionRedis(roomId, question, this.pub);
    await this.sendQuestionFromRedis(roomId, call);
  }

  /**
   * Creates and sends question stored in Redis
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
   * Handles data package to be sent based on package received
   * @param username
   * @param roomId
   * @param request
   * @param call
   * @param pubsub
   */
  async handleIncomingData(
    username: string,
    roomId: string,
    request: CollabTunnelRequest,
    call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
    pubsub: TunnelPubSub<TunnelMessage>,
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
        this.historyBuilder.setQuestion(JSON.parse(await getQuestionRedis(roomId, this.pub)));
        this.historyBuilder.setLangContent(request.data);
        await pubsub.pushMessage(createDiscoverMessage(username));
        break;
      default: // Normal data, push to publisher
        await pubsub.pushMessage(createDataMessage(username, request.data));
    }
  }

  /**
   * Extracts room token, username and nickname of user from metadata
   * @param data
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
