import { RedisClientType } from 'redis';
import { ServerDuplexStreamImpl } from '@grpc/grpc-js/build/src/server-call';
import Logger from '../utils/logger';
import { CollabTunnelRequest, CollabTunnelResponse } from '../proto/collab-service';

declare interface TunnelPubSub {
  createTopic(topic: string): Promise<void>;

  // eslint-disable-next-line max-len
  createSubscription(topic: string, call: ServerDuplexStreamImpl<CollabTunnelRequest, CollabTunnelResponse>): Promise<void>;

  push(topic: string, request: CollabTunnelRequest): Promise<void>;
}

class RedisPubSubAdapter implements TunnelPubSub {
  redisPubSub: RedisClientType;

  constructor(redisClient: RedisClientType) {
    this.redisPubSub = redisClient;
  }

  async createTopic(topic: string): Promise<void> {
    await this.redisPubSub.publish(`roomTopic-${topic}`, 'Startup');
    Logger.info(`Topic ${topic} created.`);
  }

  // eslint-disable-next-line max-len,@typescript-eslint/no-unused-vars
  async createSubscription(topic: string, call: ServerDuplexStreamImpl<CollabTunnelRequest, CollabTunnelResponse>): Promise<void> {
    await this.redisPubSub.subscribe(`roomTopic-${topic}`, (channel, message) => {
      // eslint-disable-next-line no-console
      Logger.info(`Received data :${message}`);
    });
    Logger.info(`Subscription ${topic} created.`);
  }

  async push(topic: string, request: CollabTunnelRequest): Promise<void> {
    await this.redisPubSub.publish(`roomTopic-${topic}`, JSON.stringify(request));
  }

  // async clean(topic: string): Promise<boolean> {
  //   this.redisClient.removeListener(`roomTopic-${topic}`);
  //   return true;
  // }

  //
  // async pushStream(username: string, difficulty: number): Promise<boolean> {
  //   const queueId = await this.redisClient.xAdd(
  //     MATCHMAKER_QUEUE_KEY,
  //     '*',
  //     RedisPubSubAdapter.createQueueItem(username, difficulty),
  //   );
  //   if (queueId === '') {
  //     return false;
  //   }
  //   return true;
  // }
  //
  // async getUserLock(username: string): Promise<string | null> {
  //   const key = getMatchmakerUserKey(username);
  //   const result = await this.redisClient.get(key);
  //   return result;
  // }
  //
  // async deleteUserLock(username: string): Promise<boolean> {
  //   const key = getMatchmakerUserKey(username);
  //   const result = await this.redisClient.del(key);
  //   if (result === 0) {
  //     return false;
  //   }
  //   return true;
  // }
  //
  // async lockIfUnset(username: string): Promise<boolean> {
  //   const key = getMatchmakerUserKey(username);
  //   const result = await this.redisClient.set(key, '', {
  //     NX: true,
  //     GET: true,
  //     EX: MATCHMAKER_LOCK_EXPIRY,
  //   });
  //
  //   if (result !== null) {
  //     return false;
  //   }
  //   return true;
  // }
  //
  // static createQueueItem(username: string, difficulty: number): Record<string, string> {
  //   return {
  //     user: username,
  //     diff: difficulty.toString(),
  //   };
  // }
}

function createRedisPubSubAdapter(redisClient: RedisClientType): TunnelPubSub {
  return new RedisPubSubAdapter(redisClient);
}

export {
  TunnelPubSub,
  createRedisPubSubAdapter,
};
