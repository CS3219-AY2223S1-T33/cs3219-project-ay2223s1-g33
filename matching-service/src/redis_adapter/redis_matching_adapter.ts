import { RedisClientType } from 'redis';

type MatchResult = {
  matched: boolean;
  queueId: string;
  difficulty: number;
  roomId: string;
};

interface IRedisMatchingAdapter {
  pushStream(username: string, difficulties: number[]): Promise<string | undefined>;
  removeFromSteam(queueId: string): Promise<boolean>;
  lockIfUnset(username: string): Promise<boolean>;
  setUserLock(username: string, value: string): Promise<boolean>;
  getUserLock(username: string): Promise<MatchResult | null>;
  deleteUserLock(username: string): Promise<boolean>;
}

const MATCHMAKER_QUEUE_KEY = 'matchmaker-stream';
const MATCHMAKER_LOCK_EXPIRY = 32; // Add 2 seconds as a buffer to prevent requeue
const getMatchmakerUserKey = (username: string) => `matchmaker-${username}`;
const MATCHMAKER_RESULT_DELIMITER = ';;';

class RedisMatchingAdapter implements IRedisMatchingAdapter {
  redisClient: RedisClientType;

  constructor(redisClient: RedisClientType) {
    this.redisClient = redisClient;
  }

  async pushStream(username: string, difficulties: number[]): Promise<string | undefined> {
    let queueId: string;
    try {
      queueId = await this.redisClient.xAdd(
        MATCHMAKER_QUEUE_KEY,
        '*',
        RedisMatchingAdapter.createQueueItem(username, JSON.stringify(difficulties)),
      );
    } catch {
      return undefined;
    }

    if (queueId === '') {
      return undefined;
    }
    return queueId;
  }

  async removeFromSteam(queueId: string): Promise<boolean> {
    const deleteCount = await this.redisClient.xDel(MATCHMAKER_QUEUE_KEY, queueId);
    return deleteCount > 0;
  }

  async getUserLock(username: string): Promise<MatchResult | null> {
    const key = getMatchmakerUserKey(username);
    let result: (string | null);
    try {
      result = await this.redisClient.get(key);
      if (result === null) {
        return result;
      }
    } catch {
      return null;
    }

    if (!result.includes(MATCHMAKER_RESULT_DELIMITER)) {
      return {
        matched: false,
        difficulty: 0,
        roomId: '',
        queueId: result,
      };
    }

    const tokenParts = result.split(MATCHMAKER_RESULT_DELIMITER);
    if (tokenParts.length < 2) {
      return null;
    }

    const difficulty = parseInt(tokenParts[0], 10);
    if (Number.isNaN(difficulty)) {
      return null;
    }

    return {
      matched: true,
      difficulty,
      roomId: tokenParts[1],
      queueId: '',
    };
  }

  async deleteUserLock(username: string): Promise<boolean> {
    const key = getMatchmakerUserKey(username);
    let result: number;
    try {
      result = await this.redisClient.del(key);
    } catch {
      return false;
    }

    if (result === 0) {
      return false;
    }
    return true;
  }

  async lockIfUnset(username: string): Promise<boolean> {
    const key = getMatchmakerUserKey(username);
    let result: (string | null);
    try {
      result = await this.redisClient.set(key, '', {
        NX: true,
        GET: true,
        EX: MATCHMAKER_LOCK_EXPIRY,
      });
    } catch {
      return false;
    }

    if (result !== null) {
      return false;
    }
    return true;
  }

  async setUserLock(username: string, value: string): Promise<boolean> {
    const key = getMatchmakerUserKey(username);
    let oldValue: (string | null);
    try {
      oldValue = await this.redisClient.set(key, value, {
        GET: true,
        KEEPTTL: true,
      });
    } catch {
      return false;
    }

    if (oldValue && oldValue.includes(MATCHMAKER_RESULT_DELIMITER)) {
      try {
        await this.redisClient.set(key, oldValue, {
          KEEPTTL: true,
        });
      } catch {
        return false;
      }
    }

    return true;
  }

  static createQueueItem(username: string, difficulty: string): Record<string, string> {
    return {
      user: username,
      diff: difficulty,
    };
  }
}

function createRedisMatchingAdapter(redisClient: RedisClientType): IRedisMatchingAdapter {
  return new RedisMatchingAdapter(redisClient);
}

export {
  IRedisMatchingAdapter,
  createRedisMatchingAdapter,
  MatchResult,
};
