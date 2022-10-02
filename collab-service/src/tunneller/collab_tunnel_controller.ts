import { ServerDuplexStream } from '@grpc/grpc-js';
import { createClient, RedisClientType } from 'redis';
import { createDisconnectMessage } from '../room/disconnect_message_builder';
import { createRedisPubSubAdapter } from '../redis_adapter/redis_pubsub_adapter';
import { createRedisTopicPool, RedisTopicPool } from '../redis_adapter/redis_topic_pool';
import createRoomSessionService from '../room_auth/room_session_agent';
import createUnauthorizedMessage from '../room/unauthorized_message_builder';
import createQuestionService from '../question_client/question_agent';
import setQuestionRedis from '../redis_adapter/redis_question_adapter';
import {
  CollabTunnelRequest,
  CollabTunnelResponse,
  CollabTunnelResponseFlags,
  CollabTunnelRequestFlags,
} from '../proto/collab-service';
import { CollabTunnelSerializer, TunnelMessage } from './collab_tunnel_serializer';
import { IRoomSessionAgent } from '../room_auth/room_session_agent_types';
import { IQuestionAgent } from '../question_client/question_agent_types';

const PROXY_HEADER_USERNAME = 'X-Gateway-Proxy-Username';
const PROXY_HEADER_NICKNAME = 'X-Gateway-Proxy-Nickname';
const PROXY_HEADER_ROOM_TOKEN = 'X-Gateway-Proxy-Room-Token';
const HEARTBEAT_INTERVAL = 20000;

function createCallWriter(
  call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
  username: string,
): (data: TunnelMessage) => void {
  return (message: TunnelMessage): void => {
    const res = CollabTunnelResponse.create(
      {
        data: Buffer.from(message.data),
        flags: CollabTunnelResponseFlags.COLLAB_RESPONSE_FLAG_NONE,
      },
    );

    if (message.sender !== username) {
      call.write(res);
    }
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

export default class CollabTunnelController {
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
    const roomToken: string = call.metadata.get(PROXY_HEADER_ROOM_TOKEN)[0].toString();
    const username: string = call.metadata.get(PROXY_HEADER_USERNAME)[0].toString();
    const nickname: string = call.metadata.get(PROXY_HEADER_NICKNAME)[0].toString();

    const data = await this.roomTokenAgent.verifyToken(roomToken);
    if (!data) {
      // Kill stream when invalid
      const errMsg = createUnauthorizedMessage();
      call.write(errMsg);
      call.end();
      return;
    }

    const { roomId, difficulty } = data;
    const question = await this.questionAgent.getQuestionByDifficulty(difficulty);
    await setQuestionRedis(roomId, question, this.pub);

    const redisPubSubAdapter = createRedisPubSubAdapter(
      this.pub,
      this.topicPool,
      username,
      roomId,
      new CollabTunnelSerializer(),
    );

    await redisPubSubAdapter.addOnMessageListener(createCallWriter(call, username));

    console.log('Starting Heartbeat');
    const heartbeatWorker = setInterval(() => {
      writeHeartbeat(call);
    }, HEARTBEAT_INTERVAL);

    // When data is detected
    call.on('data', (request: CollabTunnelRequest) => {
      if (isHeartbeat(request.flags)) {
        return;
      }

      redisPubSubAdapter.pushMessage({
        data: request.data,
        sender: username,
      });
    });

    // When stream closes
    call.on('end', () => {
      console.log('Killing heartbeat');
      clearInterval(heartbeatWorker);
      redisPubSubAdapter.pushMessage({
        data: createDisconnectMessage(nickname),
        sender: username,
      });

      const endFunc = () => call.end();
      redisPubSubAdapter.clean(endFunc);
    });
  }
}
