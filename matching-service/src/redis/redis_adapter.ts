import { createClient, RedisClientType } from 'redis';

interface IRedisAdapter {
  connect(): void;
  pushStream(username: string, difficulty: number): Promise<boolean>;
  lockIfUnset(username: string): Promise<boolean>;
  getUserLock(username: string): Promise<string | null>;
  deleteUserLock(username: string): Promise<boolean>;
}

const MATCHMAKER_QUEUE_KEY = 'matchmaker-stream';
const MATCHMAKER_LOCK_EXPIRY = 32; // Add 2 seconds as a buffer to prevent requeue
const getMatchmakerUserKey = (username: string) => `matchmaker-${username}`;

class RedisAdapter implements IRedisAdapter {
  redisClient: RedisClientType;

  connected: boolean;

  constructor(url: string) {
    this.redisClient = createClient({
      url,
    });
    this.connected = false;
  }

  connect() {
    if (this.connected) {
      return;
    }

    this.redisClient.connect();
    this.connected = true;
  }

  async pushStream(username: string, difficulty: number): Promise<boolean> {
    this.ensureConnected();
    const queueId = await this.redisClient.xAdd(MATCHMAKER_QUEUE_KEY, '*', RedisAdapter.createQueueItem(username, difficulty));
    if (queueId === '') {
      return false;
    }
    return true;
  }

  async getUserLock(username: string): Promise<string | null> {
    this.ensureConnected();

    const key = getMatchmakerUserKey(username);
    const result = await this.redisClient.get(key);
    return result;
  }

  async deleteUserLock(username: string): Promise<boolean> {
    this.ensureConnected();

    const key = getMatchmakerUserKey(username);
    const result = await this.redisClient.del(key);
    if (result === 0) {
      return false;
    }
    return true;
  }

  async lockIfUnset(username: string): Promise<boolean> {
    this.ensureConnected();

    const key = getMatchmakerUserKey(username);
    const result = await this.redisClient.set(key, '', {
      NX: true,
      GET: true,
      EX: MATCHMAKER_LOCK_EXPIRY,
    });

    if (result === null) {
      return false;
    }
    return true;
  }

  ensureConnected() {
    if (!this.connected) {
      throw new Error('Redis Client Not Connected');
    }
  }

  static createQueueItem(username: string, difficulty: number): Record<string, string> {
    return {
      user: username,
      diff: difficulty.toString(),
    };
  }
}

function createRedisAdapter(url: string): IRedisAdapter {
  return new RedisAdapter(url);
}

export {
  IRedisAdapter,
  createRedisAdapter,
};
