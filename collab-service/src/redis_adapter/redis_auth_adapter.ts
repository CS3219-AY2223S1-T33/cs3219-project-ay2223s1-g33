import { RedisClientType } from 'redis';

interface IRedisAuthAdapter {
  isTokenBlacklisted(token: string): Promise<boolean>;
  addTokenBlacklist(token: string): Promise<void>;
  removeTokenBlacklist(token: string): Promise<void>;
}

const jwtBlacklistKeyspace = 'auth-jwt-blacklist';
const getBlacklistForDay = (timestamp: string) => `${jwtBlacklistKeyspace}-${timestamp}`;
const tokenLifespanDays = 3;
const dayMillis = 24 * 60 * 60 * 1000;

class RedisAuthAdapter implements IRedisAuthAdapter {
  client: RedisClientType;

  constructor(client: RedisClientType) {
    this.client = client;
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const resultQueries = [];
    const today = new Date();

    for (let i = 0; i < tokenLifespanDays + 1; i += 1) {
      const dateToCheck = new Date(today);
      dateToCheck.setDate(dateToCheck.getDate() - i);
      const check = this.client.sIsMember(getBlacklistForDay(dateToCheck.toDateString()), token);
      resultQueries.push(check);
    }

    const results = await Promise.all(resultQueries);
    for (let i = 0; i < tokenLifespanDays + 1; i += 1) {
      if (results[i]) {
        return true;
      }
    }

    return false;
  }

  async addTokenBlacklist(token: string): Promise<void> {
    const today = new Date();
    const dateKey = getBlacklistForDay(today.toDateString());
    this.client.sAdd(dateKey, token);
    const todayMillis = today.getTime();
    const tokenLifespanMillis = (tokenLifespanDays + 1) * dayMillis;
    const expiryMillis = todayMillis - (todayMillis % dayMillis) + tokenLifespanMillis;
    this.client.expireAt(
      dateKey,
      Math.floor(expiryMillis / 1000),
    );
  }

  async removeTokenBlacklist(token: string): Promise<void> {
    const today = new Date();
    const operations = [];

    for (let i = 0; i < tokenLifespanDays + 1; i += 1) {
      const dateToCheck = new Date(today);
      dateToCheck.setDate(dateToCheck.getDate() - i);
      operations.push(this.client.sRem(getBlacklistForDay(dateToCheck.toDateString()), token));
    }
    await Promise.all(operations);
  }
}

function createRedisAuthAdapter(client: RedisClientType): IRedisAuthAdapter {
  return new RedisAuthAdapter(client);
}

export {
  createRedisAuthAdapter,
  IRedisAuthAdapter,
};
