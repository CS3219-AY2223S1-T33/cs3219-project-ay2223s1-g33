import { ChannelCredentials } from '@grpc/grpc-js';
import {
  IAuthenticationAgent,
  TokenUserData,
  TokenPair,
} from './authentication_agent_types';
import { SessionServiceClient } from '../proto/session-service.grpc-client';
import { AddBlacklistErrorCode, CreateTokenErrorCode } from '../proto/session-service';

class AuthenticationAgent implements IAuthenticationAgent {
  sessionServiceUrl: string;

  grpcClient: SessionServiceClient;

  constructor(sessionServiceUrl: string) {
    this.sessionServiceUrl = sessionServiceUrl;
    this.grpcClient = new SessionServiceClient(
      this.sessionServiceUrl,
      ChannelCredentials.createInsecure(),
      {},
      {},
    );
  }

  createToken(userData: TokenUserData): Promise<TokenPair> {
    return new Promise((resolve, reject) => {
      this.grpcClient.createToken({
        email: userData.username,
        nickname: userData.nickname,
      }, (err, value) => {
        if (!value) {
          reject(err);
          return;
        }

        if (value.errorCode !== CreateTokenErrorCode.CREATE_TOKEN_NO_ERROR) {
          reject(new Error('Cannot create session token'));
          return;
        }

        resolve({
          sessionToken: value.sessionToken,
          refreshToken: value.refreshToken,
        });
      });
    });
  }

  invalidateToken(token: TokenPair): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.grpcClient.addBlacklist({
        sessionToken: token.sessionToken,
        refreshToken: token.refreshToken,
      }, (err, value) => {
        if (!value) {
          reject(err);
          return;
        }

        if (value.errorCode !== AddBlacklistErrorCode.ADD_BLACKLIST_NO_ERROR) {
          reject(new Error('Cannot invalidate token'));
          return;
        }

        resolve(true);
      });
    });
  }
}

function createAuthenticationService(sessionServiceUrl: string): IAuthenticationAgent {
  return new AuthenticationAgent(sessionServiceUrl);
}

export default createAuthenticationService;
