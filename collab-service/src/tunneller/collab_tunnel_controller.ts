import { ServerDuplexStream } from '@grpc/grpc-js';
import { createClient, RedisClientType } from 'redis';
import { createAckMessage, createJoinMessage } from '../message_handler/internal/internal_message_builder';
import { createConnectedMessage, createDisconnectedMessage } from '../message_handler/room/connect_message_builder';
import { createRedisPubSubAdapter, TunnelPubSub } from '../redis_adapter/redis_pubsub_adapter';
import { createRedisTopicPool, RedisTopicPool } from '../redis_adapter/redis_topic_pool';
import createRoomSessionService from '../room_auth/room_session_agent';
import createUnauthorizedMessage from '../message_handler/room/unauthorized_message_builder';
import createQuestionService from '../question_client/question_agent';
import setQuestionRedis from '../redis_adapter/redis_question_adapter';
import Logger from '../utils/logger';
import CollabTunnelSerializer from './collab_tunnel_serializer';
import {
  CollabTunnelRequest,
  CollabTunnelResponse,
  VerifyRoomErrorCode,
} from '../proto/collab-service';
import { IRoomSessionAgent } from '../room_auth/room_session_agent_types';
import { IQuestionAgent } from '../question_client/question_agent_types';
import { ConnectionFlag, TunnelMessage } from '../message_handler/internal/internal_message_types';

const PROXY_HEADER_USERNAME = 'X-Gateway-Proxy-Username';
const PROXY_HEADER_NICKNAME = 'X-Gateway-Proxy-Nickname';
const PROXY_HEADER_ROOM_TOKEN = 'X-Gateway-Proxy-Room-Token';

function createCallWriter(
  call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
  pubsub: TunnelPubSub<TunnelMessage>,
  username: string,
  nickname: string,
): (data: TunnelMessage) => void {
  // Creates collab response to be sent to client
  function makeResponse(data: Uint8Array): CollabTunnelResponse {
    return CollabTunnelResponse.create({
      data: Buffer.from(data),
      flags: VerifyRoomErrorCode.VERIFY_ROOM_ERROR_NONE,
    });
  }
  return async (message: TunnelMessage): Promise<void> => {
    if (message.sender === username) {
      return;
    }
    switch (message.flag) {
      case ConnectionFlag.NONE: // Receive normal, Send normal
        call.write(makeResponse(message.data));
        break;
      case ConnectionFlag.JOIN: // Receive A, Send B
        Logger.info(`${username} received JOIN from ${message.sender}`);
        await pubsub.pushMessage(createAckMessage(username, nickname));
        call.write(makeResponse(createConnectedMessage(message.nick)));
        break;
      case ConnectionFlag.ACK: // Receive B, Send 'Connected'
        Logger.info(`${username} received ACK from ${message.sender}`);
        call.write(makeResponse(createConnectedMessage(message.nick)));
        break;
      default:
        Logger.error('Unknown connection flag');
        break;
    }
  };
}

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

  async handleOpenStream(
    call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
  ) {
    // When stream opens
    const {
      roomToken,
      username,
      nickname,
    } = this.extractMetadata(call);

    const data = await this.roomTokenAgent.verifyToken(roomToken);
    if (!data) {
      // Kill stream when invalid room
      const errMsg = createUnauthorizedMessage();
      call.write(errMsg);
      call.end();
      return;
    }

    const {
      roomId,
      difficulty,
    } = data;
    const question = await this.questionAgent.getQuestionByDifficulty(difficulty);
    await setQuestionRedis(roomId, question, this.pub);

    const redisPubSubAdapter = createRedisPubSubAdapter(
      this.pub,
      this.topicPool,
      username,
      roomId,
      new CollabTunnelSerializer(),
    );

    await redisPubSubAdapter.addOnMessageListener(
      createCallWriter(call, redisPubSubAdapter, username, nickname),
    );

    // Connection discovery, Send A
    await redisPubSubAdapter.pushMessage(createJoinMessage(username, nickname));

    // When data is detected
    call.on('data', (request: CollabTunnelRequest) => {
      // Send Normal
      redisPubSubAdapter.pushMessage({
        sender: username,
        nick: nickname,
        data: request.data,
        flag: ConnectionFlag.NONE,
      });
    });

    // When stream closes
    call.on('end', () => {
      // Send 'Disconnected'
      redisPubSubAdapter.pushMessage({
        sender: username,
        nick: nickname,
        data: createDisconnectedMessage(nickname),
        flag: ConnectionFlag.NONE,
      });

      const endFunc = () => call.end();
      redisPubSubAdapter.clean(endFunc);
    });
  }

  // eslint-disable-next-line class-methods-use-this
  extractMetadata(call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>) {
    const roomToken: string = call.metadata.get(PROXY_HEADER_ROOM_TOKEN)[0].toString();
    const username: string = call.metadata.get(PROXY_HEADER_USERNAME)[0].toString();
    const nickname: string = call.metadata.get(PROXY_HEADER_NICKNAME)[0].toString();
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
