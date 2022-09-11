import { RedisClientType } from 'redis';

interface IRedisMatchingAdapter {
  pushStream(username: string, difficulty: number): Promise<boolean>;
  lockIfUnset(username: string): Promise<boolean>;
  getUserLock(username: string): Promise<string | null>;
  deleteUserLock(username: string): Promise<boolean>;
}

const MATCHMAKER_QUEUE_KEY = 'matchmaker-stream';
const MATCHMAKER_LOCK_EXPIRY = 32; // Add 2 seconds as a buffer to prevent requeue
const getMatchmakerUserKey = (username: string) => `matchmaker-${username}`;

class RedisMatchingAdapter implements IRedisMatchingAdapter {
  redisClient: RedisClientType;

  constructor(redisClient: RedisClientType) {
    this.redisClient = redisClient;
  }

  async pushStream(username: string, difficulty: number): Promise<boolean> {
    const queueId = await this.redisClient.xAdd(
      MATCHMAKER_QUEUE_KEY,
      '*',
      RedisMatchingAdapter.createQueueItem(username, difficulty),
    );
    if (queueId === '') {
      return false;
    }
    return true;
  }

  async getUserLock(username: string): Promise<string | null> {
    const key = getMatchmakerUserKey(username);
    const result = await this.redisClient.get(key);
    return result;
  }

  async deleteUserLock(username: string): Promise<boolean> {
    const key = getMatchmakerUserKey(username);
    const result = await this.redisClient.del(key);
    if (result === 0) {
      return false;
    }
    return true;
  }

  async lockIfUnset(username: string): Promise<boolean> {
    const key = getMatchmakerUserKey(username);
    const result = await this.redisClient.set(key, '', {
      NX: true,
      GET: true,
      EX: MATCHMAKER_LOCK_EXPIRY,
    });

    if (result !== null) {
      return false;
    }
    return true;
  }

  static createQueueItem(username: string, difficulty: number): Record<string, string> {
    return {
      user: username,
      diff: difficulty.toString(),
    };
  }
}

function createRedisMatchingAdapter(redisClient: RedisClientType): IRedisMatchingAdapter {
  return new RedisMatchingAdapter(redisClient);
}

export {
  IRedisMatchingAdapter,
  createRedisMatchingAdapter,
};
