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
import { heartbeatQuestionRedis } from '../redis_adapter/redis_question_adapter';
import CollabTunnelSerializer from './collab_tunnel_serializer';
import { CollabTunnelRequest, CollabTunnelResponse } from '../proto/collab-service';
import { IRoomSessionAgent } from '../room_auth/room_session_agent_types';
import { IQuestionAgent } from '../question_client/question_agent_types';
import { IHistoryAgent } from '../history_client/history_agent_types';
import createHistoryService from '../history_client/history_agent';
import { createAttemptCache } from '../history_handler/attempt_cache';
import createCallWriter from './handler/call_write_handler';
import { handleQuestion } from './handler/question_get_set_handler';
import handleIncomingData from './handler/incoming_data_handler';

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
      createCallWriter(
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
    handleQuestion(call, this.questionAgent, this.pub, difficulty, roomId);

    // Upkeep gateway connection & question in redis
    const heartbeatWorker = setInterval(() => {
      call.write(makeHeartbeatResponse());
      heartbeatQuestionRedis(roomId, this.pub);
    }, HEARTBEAT_INTERVAL);

    // When data is detected
    call.on('data', (request: CollabTunnelRequest) => {
      handleIncomingData(
        call,
        redisPubSubAdapter,
        this.pub,
        attemptCache,
        this.historyAgent,
        username,
        roomId,
        request,
      );
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
