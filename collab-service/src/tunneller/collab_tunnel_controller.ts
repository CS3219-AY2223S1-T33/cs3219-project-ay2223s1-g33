import { Metadata, ServerDuplexStream } from '@grpc/grpc-js';
import { createClient, RedisClientType } from 'redis';
import {
  createAckMessage,
  createDataMessage,
  createJoinMessage,
} from '../message_handler/internal/internal_message_builder';
import {
  createDisconnectedPackage,
  createQuestionRcvPackage,
  readConnectionOpCode,
  OPCODE_QUESTION_REQ,
} from '../message_handler/room/connect_message_builder';
import {
  makeUnauthorizedMessage,
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

const PROXY_HEADER_USERNAME = 'X-Gateway-Proxy-Username';
const PROXY_HEADER_NICKNAME = 'X-Gateway-Proxy-Nickname';
const PROXY_HEADER_ROOM_TOKEN = 'X-Gateway-Proxy-Room-Token';
const HEARTBEAT_INTERVAL = 20000;

class CollabTunnelController {
  pub: RedisClientType;

  topicPool: RedisTopicPool;

  roomTokenAgent: IRoomSessionAgent;

  questionAgent: IQuestionAgent;

  constructor(redisUrl: string, questionUrl: string, roomSecret: string) {
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
  }

  /*
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
      call.write(makeUnauthorizedMessage());
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
      CollabTunnelController.createCallWriter(call, redisPubSubAdapter, username, nickname),
    );

    // Connection discovery, Send A
    await redisPubSubAdapter.pushMessage(createJoinMessage(username, nickname));

    // Retrieve and send question
    this.handleQuestion(difficulty, roomId);

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

  /*
   * Handles subscribed message received from pubsub
   * @param call, pubsub, username, nickname
   */
  static async handleWrite(
    message: TunnelMessage,
    username: string,
    nickname: string,
    call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
    pubsub: TunnelPubSub<TunnelMessage>,
  ) {
    // Prevent self echo
    if (message.sender === username) {
      return;
    }
    // Handle internal message cases
    switch (message.flag) {
      case ConnectionOpCode.DATA: // Receive normal, Send normal
        call.write(makeDataResponse(message.data));
        break;
      case ConnectionOpCode.JOIN: // Receive A, Send B
        Logger.info(`${username} received JOIN from ${message.sender}`);
        await pubsub.pushMessage(createAckMessage(username, nickname));
        call.write(makeDataResponse(message.data));
        break;
      case ConnectionOpCode.ACK: // Receive B, Send 'Connected'
        Logger.info(`${username} received ACK from ${message.sender}`);
        call.write(makeDataResponse(message.data));
        break;
      default:
        Logger.error('Unknown connection flag');
        break;
    }
  }

  /*
   * Creates encapsulated lambda for writing subscribed data to client
   * @param call, pubsub, username, nickname
   */
  static createCallWriter(
    call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
    pubsub: TunnelPubSub<TunnelMessage>,
    username: string,
    nickname: string,
  ): (data: TunnelMessage) => void {
    return async (message: TunnelMessage): Promise<void> => {
      await CollabTunnelController.handleWrite(message, username, nickname, call, pubsub);
    };
  }

  /*
   * Handles question retrieval from client & saves unto Redis
   * @param difficulty, roomId
   */
  async handleQuestion(
    difficulty: number,
    roomId: string,
  ) {
    const question = await this.questionAgent.getQuestionByDifficulty(difficulty);
    if (question === undefined) {
      Logger.error(`No question of difficulty ${difficulty} found`);
      return;
    }
    await setQuestionRedis(roomId, question, this.pub);
  }

  /*
   * Handles data package to be sent based on package received
   * @param username, roomId, request, call
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
    let question;
    let dataToSend;
    // Handle external connection message cases
    switch (readConnectionOpCode(request.data)) {
      case OPCODE_QUESTION_REQ: // Retrieve question, send back to user
        Logger.info(`${username} requested for question`);
        question = await getQuestionRedis(roomId, this.pub);
        if (question === null) {
          Logger.error(`No question of room ${roomId} found`);
          return;
        }
        dataToSend = createQuestionRcvPackage(question);
        call.write(makeDataResponse(dataToSend));
        return;
      default:
        // Normal data, push to publisher
        dataToSend = request.data;
    }
    await pubsub.pushMessage(createDataMessage(username, dataToSend));
  }

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

function createCollabTunnelController(redisUrl: string, questionUrl: string, roomSecret: string)
  : CollabTunnelController {
  return new CollabTunnelController(redisUrl, questionUrl, roomSecret);
}

export {
  CollabTunnelController,
  createCollabTunnelController,
};
