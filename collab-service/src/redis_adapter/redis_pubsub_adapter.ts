import { RedisClientType } from 'redis';
import Logger from '../utils/logger';
import {
  CollabTunnelRequest,
  CollabTunnelResponse,
  VerifyRoomErrorCode,
} from '../proto/collab-service';
import TunnelPubSub from './redis_pubsub_types';

class RedisPubSubAdapter implements TunnelPubSub<CollabTunnelRequest, CollabTunnelResponse> {
  redisPub: RedisClientType;

  redisSub: RedisClientType;

  username: string;

  topic: string;

  constructor(
    redisPub: RedisClientType,
    redisSub: RedisClientType,
    username: string,
    roomId: string,
  ) {
    this.redisPub = redisPub;
    this.redisSub = redisSub;
    this.username = username;
    this.topic = roomId;
  }

  async registerEvent(
    call: (res: CollabTunnelResponse) => void,
  ): Promise<void> {
    await this.redisSub.subscribe(`pubsub-${this.topic}`, (message) => {
      const messageJson = JSON.parse(message);
      const {
        sender,
        data,
      } = messageJson;
      const res = CollabTunnelResponse.create(
        {
          data: Buffer.from(data),
          flags: VerifyRoomErrorCode.VERIFY_ROOM_ERROR_NONE,
        },
      );
      if (sender !== this.username) {
        call(res);
      }
    });
    Logger.info(`Event ${this.topic} registered by ${this.username}`);
  }

  async push(request: CollabTunnelRequest): Promise<void> {
    const messageJson = {
      sender: this.username,
      data: request.data,
    };
    await this.redisPub.publish(`pubsub-${this.topic}`, JSON.stringify(messageJson));
  }

  async clean(
    call: () => void,
  ): Promise<void> {
    await this.redisSub.unsubscribe(`pubsub-${this.topic}`);
    call();
    Logger.info(`User ${this.username} unregistered event ${this.topic}`);
  }
}

function createRedisPubSubAdapter(
  redisPub: RedisClientType,
  redisSub: RedisClientType,
  username: string,
  roomId: string,
) : TunnelPubSub<CollabTunnelRequest, CollabTunnelResponse> {
  return new RedisPubSubAdapter(redisPub, redisSub, username, roomId);
}

export {
  TunnelPubSub,
  createRedisPubSubAdapter,
};
