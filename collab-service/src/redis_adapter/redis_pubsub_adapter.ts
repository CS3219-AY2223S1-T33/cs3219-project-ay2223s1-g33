import { RedisClientType } from 'redis';
import Logger from '../utils/logger';
import { TunnelPubSub, TunnelSerializer } from './redis_pubsub_types';
import { RedisTopicPool } from './redis_topic_pool';

class RedisPubSubAdapter<T> implements TunnelPubSub<T> {
  redisPub: RedisClientType;

  redisTopicPool: RedisTopicPool;

  username: string;

  topic: string;

  serializer: TunnelSerializer<T>;

  handler: ((msg: string) => void) | undefined;

  constructor(
    redisPub: RedisClientType,
    redisTopicPool: RedisTopicPool,
    username: string,
    roomId: string,
    serializer: TunnelSerializer<T>,
  ) {
    this.redisPub = redisPub;
    this.redisTopicPool = redisTopicPool;
    this.username = username;
    this.topic = roomId;
    this.serializer = serializer;
    this.handler = undefined;
  }

  async addOnMessageListener(
    call: (res: T) => void,
  ): Promise<void> {
    if (this.handler !== undefined) {
      return;
    }
    this.handler = (res) => {
      const received = this.serializer.deserialize(res);
      if (received === undefined) {
        Logger.warn(`User ${this.username} received an invalid pub-sub struct`);
        return;
      }
      call(received);
    };

    this.redisTopicPool.registerTopic(`pubsub-${this.topic}`, this.handler);
  }

  async pushMessage(request: T): Promise<void> {
    await this.redisPub.publish(`pubsub-${this.topic}`, this.serializer.serialize(request));
  }

  async clean(
    call: () => void,
  ): Promise<void> {
    if (this.handler === undefined) {
      return;
    }
    call();
    await this.redisTopicPool.unregisterTopic(`pubsub-${this.topic}`, this.handler);
  }
}

function createRedisPubSubAdapter<T>(
  redisPub: RedisClientType,
  redisTopicPool: RedisTopicPool,
  username: string,
  roomId: string,
  serializer: TunnelSerializer<T>,
) : TunnelPubSub<T> {
  return new RedisPubSubAdapter(redisPub, redisTopicPool, username, roomId, serializer);
}

export {
  TunnelPubSub,
  createRedisPubSubAdapter,
};
