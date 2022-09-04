import { sign, verify } from 'jsonwebtoken';
import { randomUUID } from 'crypto';
import { IAuthenticationService } from './authentication_service_types';

class AuthenticationService implements IAuthenticationService {
  signingSecret: string;

  constructor(signingSecret: string) {
    this.signingSecret = signingSecret;
  }

  createToken(payload: Object): string {
    const token = sign({
      data: payload,
      uuid: AuthenticationService.generateSecureUUID(),

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

function createAuthenticationService(signingSecret: string): IAuthenticationService {
  return new AuthenticationService(signingSecret);
}

export default createAuthenticationService;
