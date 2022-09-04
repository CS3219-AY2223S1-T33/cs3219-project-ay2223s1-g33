import bcrypt from 'bcrypt';
import Validator from 'validator';
import { LoginErrorCode, LoginRequest, LoginResponse } from '../../proto/user-bff-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { UserServiceClient } from '../../proto/user-service.grpc-client';
import { PasswordUser, User } from '../../proto/types';
import { IAuthenticationService } from '../../auth/authentication_service_types';

class LoginHandler implements IApiHandler<LoginRequest, LoginResponse> {
  rpcClient: UserServiceClient;

  authService: IAuthenticationService;

  constructor(rpcClient: UserServiceClient, authService: IAuthenticationService) {
    this.rpcClient = rpcClient;
    this.authService = authService;
  }

  async handle(request: LoginRequest): Promise<LoginResponse> {
    const validatedRequest = LoginHandler.validateRequest(request);
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

    return {
      errorCode: LoginErrorCode.LOGIN_ERROR_NONE,
      user: user.userInfo,
      errorMessage: '',
      sessionToken: this.authService.createToken({
        username: user.userInfo?.username,
      }),
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

  static buildErrorResponse(errorCode: LoginErrorCode, errorMessage: string): LoginResponse {
    return {
      errorCode,
      errorMessage,
      sessionToken: '',
    };
  }
}

type ValidatedRequest = {
  username: string,
  password: string,
};

export default LoginHandler;
