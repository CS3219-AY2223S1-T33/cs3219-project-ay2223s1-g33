import { sign, verify } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { IAuthenticationAgent, ITokenBlacklist } from './authentication_agent_types';
import createTokenBlacklist from './token_blacklist';

class AuthenticationAgent implements IAuthenticationAgent {
  signingSecret: string;

  tokenBlacklist: ITokenBlacklist;

  constructor(signingSecret: string) {
    this.signingSecret = signingSecret;
    this.tokenBlacklist = createTokenBlacklist();
  }

  createToken(payload: Object): string {
    const token = sign({
      data: payload,
      uuid: AuthenticationAgent.generateSecureUUID(),

    }, this.signingSecret);

    return token;
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      verify(token, this.signingSecret);
      const isBlacklisted = await this.tokenBlacklist.isTokenBlacklisted(token);
      return !isBlacklisted;
    } catch {
      return false;
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

function createAuthenticationService(signingSecret: string): IAuthenticationAgent {
  return new AuthenticationAgent(signingSecret);
}

export default createAuthenticationService;
