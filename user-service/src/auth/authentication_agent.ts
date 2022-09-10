import { sign, verify } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import {
  IAuthenticationAgent,
  ITokenBlacklist,
  TokenPayload,
  TokenUserData,
} from './authentication_agent_types';
import createTokenBlacklist from './token_blacklist';
import { IRedisAuthAdapter } from '../redis_adapter/redis_auth_adapter';

class AuthenticationAgent implements IAuthenticationAgent {
  signingSecret: string;

  tokenBlacklist: ITokenBlacklist;

  constructor(signingSecret: string, redisAdapter: IRedisAuthAdapter) {
    this.signingSecret = signingSecret;
    this.tokenBlacklist = createTokenBlacklist(redisAdapter);
  }

  createToken(userData: TokenUserData): string {
    const payload: TokenPayload = {
      user: userData,
      uuid: AuthenticationAgent.generateSecureUUID(),
    };
    const token = sign(payload, this.signingSecret, {
      expiresIn: '3d',
    });

    return token;
  }

  async verifyToken(token: string): Promise<TokenUserData | undefined> {
    try {
      const decoded = <TokenPayload> verify(token, this.signingSecret);
      const isBlacklisted = await this.tokenBlacklist.isTokenBlacklisted(token);
      if (isBlacklisted) {
        return undefined;
      }
      return decoded.user;
    } catch {
      return undefined;
    }
  }

  async invalidateToken(token: string): Promise<boolean> {
    if (!this.verifyToken(token)) {
      return false;
    }

    await this.tokenBlacklist.addToken(token);
    return true;
  }

  static generateSecureUUID(): string {
    return randomUUID();
  }
}

function createAuthenticationService(
  signingSecret: string,
  redisAdapter: IRedisAuthAdapter,
): IAuthenticationAgent {
  return new AuthenticationAgent(signingSecret, redisAdapter);
}

export default createAuthenticationService;
