import bcrypt from 'bcrypt';
import Validator from 'validator';
import { LoginErrorCode, LoginRequest, LoginResponse } from '../../proto/user-bff-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { UserServiceClient } from '../../proto/user-service.grpc-client';
import { PasswordUser, User } from '../../proto/types';
import { IAuthenticationAgent } from '../../auth/authentication_agent_types';
import Constants from '../../utils/constants';

class LoginHandler implements IApiHandler<LoginRequest, LoginResponse> {
  rpcClient: UserServiceClient;

  authService: IAuthenticationAgent;

  constructor(rpcClient: UserServiceClient, authService: IAuthenticationAgent) {
    this.rpcClient = rpcClient;
    this.authService = authService;
  }

  async handle(request: ApiRequest<LoginRequest>): Promise<ApiResponse<LoginResponse>> {
    const requestObject = request.request;

    const validatedRequest = LoginHandler.validateRequest(requestObject);
    if (validatedRequest instanceof Error) {
      return LoginHandler.buildErrorResponse(
        LoginErrorCode.LOGIN_ERROR_BAD_REQUEST,
        validatedRequest.message,
      );
    }

    let user: PasswordUser | undefined;
    try {
      user = await this.getUserByUsername(validatedRequest.username);
    } catch {
      return LoginHandler.buildErrorResponse(
        LoginErrorCode.LOGIN_ERROR_INTERNAL_ERROR,
        'An internal error occurred',
      );
    }

    if (!user) {
      return LoginHandler.buildErrorResponse(
        LoginErrorCode.LOGIN_ERROR_INVALID_CREDENTIALS,
        'Invalid Credentials',
      );
    }

    const isLoginSuccessful = await bcrypt.compare(validatedRequest.password, user.password);
    if (!isLoginSuccessful) {
      return LoginHandler.buildErrorResponse(
        LoginErrorCode.LOGIN_ERROR_INVALID_CREDENTIALS,
        'Invalid Credentials',
      );
    }

    const token = await this.authService.createToken({
      username: user.userInfo?.username,
      nickname: user.userInfo?.nickname,
    });

    return {
      response: {
        errorCode: LoginErrorCode.LOGIN_ERROR_NONE,
        user: user.userInfo,
        errorMessage: '',
      },
      headers: {
        'Set-Cookie': [
          `${Constants.COOKIE_SESSION_TOKEN}=${token.sessionToken}; Path=/`,
          `${Constants.COOKIE_REFRESH_TOKEN}=${token.refreshToken}; Path=/; HttpOnly`,
        ],
      },
    };
  }

  static validateRequest(request: LoginRequest): (ValidatedRequest | Error) {
    if (!request.credentials) {
      return new Error('No credentials provided');
    }

    const username = request.credentials.username.trim();
    const password = request.credentials.password.trim();

    if (Validator.isEmpty(username) || Validator.isEmpty(password)) {
      return new Error('Empty field provided');
    }

    if (!Validator.isEmail(username)) {
      return new Error('Username must be a valid email');
    }

    const sanitizedEmail = Validator.normalizeEmail(username);
    if (!sanitizedEmail) {
      return new Error('Username must be a valid email');
    }

    return {
      username: sanitizedEmail,
      password,
    };
  }

  getUserByUsername(username: string): Promise<PasswordUser | undefined> {
    const searchUserObject: User = User.create();
    searchUserObject.username = username;

    return new Promise<PasswordUser | undefined>((resolve, reject) => {
      this.rpcClient.getUser(
        {
          user: searchUserObject,
        },
        (err, value) => {
          if (!value) {
            reject(err);
            return;
          }

          if (!value.user && value.errorMessage !== '') {
            reject(value.errorMessage);
            return;
          }
          resolve(value.user);
        },
      );
    });
  }

  static buildErrorResponse(errorCode: LoginErrorCode, errorMessage: string)
    : ApiResponse<LoginResponse> {
    return {
      headers: {},
      response: {
        errorCode,
        errorMessage,
      },
    };
  }
}

type ValidatedRequest = {
  username: string,
  password: string,
};

export default LoginHandler;
