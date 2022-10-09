import Validator from 'validator';
import { LoginErrorCode, LoginRequest, LoginResponse } from '../../proto/user-service';
import {
  IApiHandler,
  ApiRequest,
  ApiResponse,
  ILoopbackServiceChannel,
} from '../../api_server/api_server_types';
import { PasswordUser, User } from '../../proto/types';
import { IAuthenticationAgent, TokenPair } from '../../auth/authentication_agent_types';
import GatewayConstants from '../../utils/gateway_constants';
import { IUserCrudService } from '../../proto/user-crud-service.grpc-server';
import { GetUserRequest, GetUserResponse } from '../../proto/user-crud-service';
import IHashAgent from '../../auth/hash_agent_types.d.ts';

class LoginHandler implements IApiHandler<LoginRequest, LoginResponse> {
  rpcClient: ILoopbackServiceChannel<IUserCrudService>;

  authAgent: IAuthenticationAgent;

  hashAgent: IHashAgent;

  constructor(
    rpcClient: ILoopbackServiceChannel<IUserCrudService>,
    authAgent: IAuthenticationAgent,
    hashAgent: IHashAgent,
  ) {
    this.rpcClient = rpcClient;
    this.authAgent = authAgent;
    this.hashAgent = hashAgent;
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

    const isLoginSuccessful = await this.hashAgent.validatePassword(
      validatedRequest.password,
      user.password,
    );

    if (!isLoginSuccessful) {
      return LoginHandler.buildErrorResponse(
        LoginErrorCode.LOGIN_ERROR_INVALID_CREDENTIALS,
        'Invalid Credentials',
      );
    }

    let token: TokenPair;
    try {
      token = await this.authAgent.createToken({
        username: user.userInfo?.username,
        nickname: user.userInfo?.nickname,
      });
    } catch {
      return LoginHandler.buildErrorResponse(
        LoginErrorCode.LOGIN_ERROR_INTERNAL_ERROR,
        'Internal Error',
      );
    }

    return {
      response: {
        errorCode: LoginErrorCode.LOGIN_ERROR_NONE,
        user: user.userInfo,
        errorMessage: '',
      },
      headers: {
        'Set-Cookie': [
          `${GatewayConstants.COOKIE_SESSION_TOKEN}=${token.sessionToken}; Path=/`,
          `${GatewayConstants.COOKIE_REFRESH_TOKEN}=${token.refreshToken}; Path=/; HttpOnly`,
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

  async getUserByUsername(username: string): Promise<PasswordUser | undefined> {
    const searchUserObject: User = User.create();
    searchUserObject.username = username;

    const request: GetUserRequest = {
      user: searchUserObject,
    };

    const result = await this.rpcClient.callRoute<GetUserRequest, GetUserResponse>('getUser', request, GetUserResponse);
    if (!result) {
      return undefined;
    }

    if (!result.user && result.errorMessage !== '') {
      throw new Error(result.errorMessage);
    }

    return result.user;
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
