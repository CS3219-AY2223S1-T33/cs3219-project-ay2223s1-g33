import { Metadata, ServerDuplexStream } from '@grpc/grpc-js';
import { createClient, RedisClientType } from 'redis';
import {
  createAckMessage,
  createJoinMessage,
} from '../message_handler/internal/internal_message_builder';
import { createDisconnectedPackage } from '../message_handler/room/connect_message_builder';
import { createRedisPubSubAdapter, TunnelPubSub } from '../redis_adapter/redis_pubsub_adapter';
import { createRedisTopicPool, RedisTopicPool } from '../redis_adapter/redis_topic_pool';
import createRoomSessionService from '../room_auth/room_session_agent';
import createUnauthorizedMessage from '../message_handler/room/unauthorized_message_builder';
import createQuestionService from '../question_client/question_agent';
import { setQuestionRedis, getQuestionRedis } from '../redis_adapter/redis_question_adapter';
import Logger from '../utils/logger';
import CollabTunnelSerializer from './collab_tunnel_serializer';
import {
  CollabTunnelRequest,
  CollabTunnelResponse,
  CollabTunnelResponseFlags,
  CollabTunnelRequestFlags,
} from '../proto/collab-service';
import { IRoomSessionAgent } from '../room_auth/room_session_agent_types';
import { IQuestionAgent } from '../question_client/question_agent_types';
import { ConnectionOpCode, TunnelMessage } from '../message_handler/internal/internal_message_types';

const PROXY_HEADER_USERNAME = 'X-Gateway-Proxy-Username';
const PROXY_HEADER_NICKNAME = 'X-Gateway-Proxy-Nickname';
const PROXY_HEADER_ROOM_TOKEN = 'X-Gateway-Proxy-Room-Token';
const HEARTBEAT_INTERVAL = 20000;

// Creates collab response to be sent to client
function makeResponse(data: Uint8Array): CollabTunnelResponse {
  return CollabTunnelResponse.create({
    data: Buffer.from(data),
    flags: CollabTunnelResponseFlags.COLLAB_RESPONSE_FLAG_NONE,
  });
}

async function writerHandler(
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
  // Handle message cases
  switch (message.flag) {
    case ConnectionOpCode.DATA: // Receive normal, Send normal
      call.write(makeResponse(message.data));
      break;
    case ConnectionOpCode.JOIN: // Receive A, Send B
      Logger.info(`${username} received JOIN from ${message.sender}`);
      await pubsub.pushMessage(createAckMessage(username, nickname));
      call.write(makeResponse(message.data));
      break;
    case ConnectionOpCode.ACK: // Receive B, Send 'Connected'
      Logger.info(`${username} received ACK from ${message.sender}`);
      call.write(makeResponse(message.data));
      break;
    default:
      Logger.error('Unknown connection flag');
      break;
  }
}

function createCallWriter(
  call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
  pubsub: TunnelPubSub<TunnelMessage>,
  username: string,
  nickname: string,
): (data: TunnelMessage) => void {
  return async (message: TunnelMessage): Promise<void> => {
    await writerHandler(message, username, nickname, call, pubsub);
  };
}

function writeHeartbeat(call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>) {
  const res = CollabTunnelResponse.create(
    {
      data: Buffer.from([]),
      flags: CollabTunnelResponseFlags.COLLAB_RESPONSE_FLAG_HEARTBEAT,
    },
  );
  call.write(res);
}

function isHeartbeat(flag: number): boolean {
  /* eslint no-bitwise: ["error", { "allow": ["&"] }] */
  return (flag & CollabTunnelRequestFlags.COLLAB_REQUEST_FLAG_HEARTBEAT)
    === CollabTunnelRequestFlags.COLLAB_REQUEST_FLAG_HEARTBEAT;
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
    } = CollabTunnelController.extractMetadata(call.metadata);

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

    // Retrieve and send question
    this.handleQuestion(difficulty, roomId);

    const heartbeatWorker = setInterval(() => {
      writeHeartbeat(call);
    }, HEARTBEAT_INTERVAL);

    // When data is detected
    call.on('data', (request: CollabTunnelRequest) => {
      if (isHeartbeat(request.flags)) {
        return;
      }
      // Send Normal
      redisPubSubAdapter.pushMessage({
        sender: username,
        data: request.data,
        flag: ConnectionOpCode.DATA,
      });
    });

    // When stream closes
    call.on('end', () => {
      clearInterval(heartbeatWorker);

      // Send 'Disconnected'
      redisPubSubAdapter.pushMessage({
        sender: username,
        data: createDisconnectedPackage(nickname),
        flag: ConnectionOpCode.DATA,
      });

      const endFunc = () => call.end();
      redisPubSubAdapter.clean(endFunc);
    });
  }

  async handleQuestion(
    difficulty: number,
    roomId: string,
  ) {
    const question = await this.questionAgent.getQuestionByDifficulty(difficulty);
    setQuestionRedis(roomId, question, this.pub);
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
