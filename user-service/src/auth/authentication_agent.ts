import { sign, verify } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { IAuthenticationAgent } from './authentication_agent_types';

class AuthenticationAgent implements IAuthenticationAgent {
  signingSecret: string;

  constructor(signingSecret: string) {
    this.signingSecret = signingSecret;
  }

  createToken(payload: Object): string {
    const token = sign({
      data: payload,
      uuid: AuthenticationAgent.generateSecureUUID(),

    }, this.signingSecret);

    return token;
  }

  verifyToken(token: string): boolean {
    try {
      verify(token, this.signingSecret);
      return true;
    } catch {
      return false;
    }
  }

  static generateSecureUUID(): string {
    return randomUUID();
  }
}

function createAuthenticationService(signingSecret: string): IAuthenticationAgent {
  return new AuthenticationAgent(signingSecret);
}

export default createAuthenticationService;
