import { ITokenBlacklist } from './authentication_agent_types';

/*
This class will be changed from a memory-based implementation to a Redis-based implementation.
*/
class TokenBlacklist implements ITokenBlacklist {
  blacklistSet: Set<string>;

  constructor() {
    this.blacklistSet = new Set<string>();
  }

  async addToken(token: string): Promise<boolean> {
    this.blacklistSet.add(token);
    return true;
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    return this.blacklistSet.has(token);
  }

  async removeToken(token: string): Promise<boolean> {
    this.blacklistSet.delete(token);
    return true;
  }
}

export default function createTokenBlacklist(): ITokenBlacklist {
  return new TokenBlacklist();
}
