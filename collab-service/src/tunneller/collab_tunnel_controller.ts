import { Metadata, ServerDuplexStream } from '@grpc/grpc-js';
import { createClient, RedisClientType } from 'redis';
import {
  createJoinMessage, createDataMessage,
} from '../message_handler/internal/internal_message_builder';
import { createDisconnectedPackage } from '../message_handler/room/connect_message_builder';
import {
  makeUnauthorizedResponse, makeHeartbeatResponse,
} from '../message_handler/room/response_message_builder';
import { createRedisPubSubAdapter } from '../redis_adapter/redis_pubsub_adapter';
import { createRedisTopicPool, RedisTopicPool } from '../redis_adapter/redis_topic_pool';
import createRoomSessionService from '../room_auth/room_session_agent';
import createQuestionService from '../question_client/question_agent';
import { refreshRedisQuestionExpiry } from '../redis_adapter/redis_question_adapter';
import CollabTunnelSerializer from './collab_tunnel_serializer';
import { CollabTunnelRequest, CollabTunnelResponse } from '../proto/collab-service';
import { IRoomSessionAgent } from '../room_auth/room_session_agent_types';
import { IQuestionAgent } from '../question_client/question_agent_types';
import createHistoryAgent from '../history_client/history_agent';
import { TunnelMessage } from '../message_handler/internal/internal_message_types';
import createCollabTunnelBridge from './collab_tunnel_bridge';
import createExecuteAgent from '../executor_client/executor_agent';

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

  executeAgent: IExecuteAgent;

  constructor(
    redisUrl: string,
    questionUrl: string,
    historyUrl: string,
    judge0URL: string,
    roomSecret: string,
  ) {
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

    this.historyAgent = createHistoryAgent(historyUrl);

    this.executeAgent = createExecuteAgent(judge0URL);
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

    const tunnelBridge = createCollabTunnelBridge(
      call,
      redisPubSubAdapter,
      this.pub,
      this.questionAgent,
      this.historyAgent,
      this.executeAgent,
      username,
      nickname,
      roomId,
    );

    await redisPubSubAdapter.addOnMessageListener(
      (message: TunnelMessage) => tunnelBridge.handleRedisMessages(message),
    );

    // Connection discovery, Send A
    await redisPubSubAdapter.pushMessage(createJoinMessage(username, nickname));

    // Retrieve and send question
    tunnelBridge.generateQuestion(difficulty);

    // Upkeep gateway connection & question in redis
    const heartbeatWorker = setInterval(() => {
      call.write(makeHeartbeatResponse());
      refreshRedisQuestionExpiry(roomId, this.pub);
    }, HEARTBEAT_INTERVAL);

    // When data is detected
    call.on('data', (request: CollabTunnelRequest) => tunnelBridge.handleClientMessage(request));

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
  judge0URL: string,
  roomSecret: string,
): CollabTunnelController {
  return new CollabTunnelController(
    redisUrl,
    questionUrl,
    historyUrl,
    judge0URL,
    roomSecret,
  );
}

export {
  CollabTunnelController,
  createCollabTunnelController,
};
