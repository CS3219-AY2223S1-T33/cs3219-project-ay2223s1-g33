import { RedisClientType } from 'redis';
import Logger from '../utils/logger';
import TunnelPubSub from './redis_pubsub_types';

class RedisPubSubAdapter implements TunnelPubSub<string> {
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
    call: (res: string) => void,
  ): Promise<void> {
    await this.redisSub.subscribe(`pubsub-${this.topic}`, (res) => {
      call(res);
    });
    Logger.info(`Event ${this.topic} registered by ${this.username}`);
  }

  async push(request: string): Promise<void> {
    await this.redisPub.publish(`pubsub-${this.topic}`, request);
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
) : TunnelPubSub<string> {
  return new RedisPubSubAdapter(redisPub, redisSub, username, roomId);
}

export {
  TunnelPubSub,
  createRedisPubSubAdapter,
};
