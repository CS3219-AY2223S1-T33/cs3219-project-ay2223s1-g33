import { IRedisAuthAdapter } from '../redis_adapter/redis_auth_adapter';
import { ITokenBlacklist } from './authentication_agent_types';

/*
This class will be changed from a memory-based implementation to a Redis-based implementation.
*/
class TokenBlacklist implements ITokenBlacklist {
  redisAdapter: IRedisAuthAdapter;

  constructor(redisAdapter: IRedisAuthAdapter) {
    this.redisAdapter = redisAdapter;
  }

  async addToken(token: string): Promise<boolean> {
    await this.redisAdapter.addTokenBlacklist(token);
    return true;
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.redisAdapter.isTokenBlacklisted(token);
  }

  async removeToken(token: string): Promise<boolean> {
    await this.redisAdapter.removeTokenBlacklist(token);
    return true;
  }
}

export default function createTokenBlacklist(redisAdapter: IRedisAuthAdapter): ITokenBlacklist {
  return new TokenBlacklist(redisAdapter);
}
