import { RedisClientType } from 'redis';
import Logger from '../utils/logger';
import { TunnelPubSub, TunnelSerializer } from './redis_pubsub_types';

class RedisPubSubAdapter<T> implements TunnelPubSub<T> {
  redisPub: RedisClientType;

  redisSub: RedisClientType;

  username: string;

  topic: string;

  serializer: TunnelSerializer<T>;

  constructor(
    redisPub: RedisClientType,
    redisSub: RedisClientType,
    username: string,
    roomId: string,
    serializer: TunnelSerializer<T>,
  ) {
    this.redisPub = redisPub;
    this.redisSub = redisSub;
    this.username = username;
    this.topic = roomId;
    this.serializer = serializer;
  }

  async addOnMessageListener(
    call: (res: T) => void,
  ): Promise<void> {
    await this.redisSub.subscribe(`pubsub-${this.topic}`, (res) => {
      const received = this.serializer.deserialize(res);
      if (received === undefined) {
        Logger.warn(`User ${this.username} received an invalid pub-sub struct`);
        return;
      }
      call(received);
    });
    Logger.info(`Event ${this.topic} registered by ${this.username}`);
  }

  async pushMessage(request: T): Promise<void> {
    await this.redisPub.publish(`pubsub-${this.topic}`, this.serializer.serialize(request));
  }

  async clean(
    call: () => void,
  ): Promise<void> {
    await this.redisSub.unsubscribe(`pubsub-${this.topic}`);
    call();
    Logger.info(`User ${this.username} unregistered event ${this.topic}`);
  }
}

function createRedisPubSubAdapter<T>(
  redisPub: RedisClientType,
  redisSub: RedisClientType,
  username: string,
  roomId: string,
  serializer: TunnelSerializer<T>,
) : TunnelPubSub<T> {
  return new RedisPubSubAdapter(redisPub, redisSub, username, roomId, serializer);
}

export {
  TunnelPubSub,
  createRedisPubSubAdapter,
};
