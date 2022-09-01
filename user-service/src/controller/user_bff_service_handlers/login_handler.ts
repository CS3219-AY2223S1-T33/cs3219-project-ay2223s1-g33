import bcrypt from 'bcrypt';
import { LoginErrorCode, LoginRequest, LoginResponse } from '../../proto/user-bff-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { UserServiceClient } from '../../proto/user-service.grpc-client';
import { PasswordUser, User } from '../../proto/types';

class LoginHandler implements IApiHandler<LoginRequest, LoginResponse> {
  rpcClient: UserServiceClient;

  constructor(rpcClient: UserServiceClient) {
    this.rpcClient = rpcClient;
  }

  async handle(request: LoginRequest): Promise<LoginResponse> {
    if (!request.credentials) {
      return LoginHandler.buildErrorResponse(LoginErrorCode.LOGIN_ERROR_BAD_REQUEST, 'Bad Login Request');
    }

    if (request.credentials.username.trim() === '' || request.credentials.password.trim() === '') {
      return LoginHandler.buildErrorResponse(LoginErrorCode.LOGIN_ERROR_BAD_REQUEST, 'Bad Login Request');
    }

    let user: (PasswordUser | undefined);
    try {
      user = await this.getUserByUsername(request.credentials.username);
    } catch {
      return LoginHandler.buildErrorResponse(LoginErrorCode.LOGIN_ERROR_INTERNAL_ERROR, 'An internal error occurred');
    }

    if (!user) {
      return LoginHandler.buildErrorResponse(LoginErrorCode.LOGIN_ERROR_INVALID_CREDENTIALS, 'Invalid Credentials');
    }

    const isLoginSuccessful = await bcrypt.compare(request.credentials.password, user.password);
    if (!isLoginSuccessful) {
      return LoginHandler.buildErrorResponse(LoginErrorCode.LOGIN_ERROR_INVALID_CREDENTIALS, 'Invalid Credentials');
    }

    return {
      errorCode: LoginErrorCode.LOGIN_ERROR_NONE,
      user: user.userInfo,
      errorMessage: '',
      sessionToken: 'Placeholder token',
    };
  }

  getUserByUsername(username: string): Promise<(PasswordUser | undefined)> {
    const searchUserObject: User = User.create();
    searchUserObject.username = username;

    return new Promise<(PasswordUser | undefined)>((resolve, reject) => {
      this.rpcClient.getUser({
        user: searchUserObject,
      }, (err, value) => {
        if (!value) {
          reject(err);
          return;
        }

        if (!value.user && value.errorMessage !== '') {
          reject(value.errorMessage);
          return;
        }
        resolve(value.user);
      });
    });
  }

  static buildErrorResponse(errorCode: LoginErrorCode, errorMessage: string): LoginResponse {
    return {
      errorCode,
      errorMessage,
      sessionToken: '',
    };
  }
}

export default LoginHandler;
