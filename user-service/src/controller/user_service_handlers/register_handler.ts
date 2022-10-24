import Validator from 'validator';
import { RegisterErrorCode, RegisterRequest, RegisterResponse } from '../../proto/user-service';
import {
  IApiHandler,
  ApiRequest,
  ApiResponse,
} from '../../api_server/api_server_types';
import { PasswordUser } from '../../proto/types';
import { CreateUserRequest, CreateUserResponse } from '../../proto/user-crud-service';
import { IUserCrudService } from '../../proto/user-crud-service.grpc-server';
import IHashAgent from '../../auth/hash_agent_types.d';
import { ILoopbackServiceChannel } from '../../api_server/loopback_server_types';

function getHeaderlessResponse(resp: RegisterResponse): ApiResponse<RegisterResponse> {
  return {
    response: resp,
    headers: {},
  };
}

class RegisterHandler implements IApiHandler<RegisterRequest, RegisterResponse> {
  rpcLoopback: ILoopbackServiceChannel<IUserCrudService>;

  hashAgent: IHashAgent;

  constructor(rpcLoopback: ILoopbackServiceChannel<IUserCrudService>, hashAgent: IHashAgent) {
    this.rpcLoopback = rpcLoopback;
    this.hashAgent = hashAgent;
  }

  async handle(request: ApiRequest<RegisterRequest>): Promise<ApiResponse<RegisterResponse>> {
    const requestObject = request.request;

    const validatedRequest = RegisterHandler.validateRequest(requestObject);
    if (validatedRequest instanceof Error) {
      return RegisterHandler.buildErrorResponse(
        RegisterErrorCode.REGISTER_ERROR_BAD_REQUEST,
        validatedRequest.message,
      );
    }

    const hash = await this.hashAgent.hashPassword(validatedRequest.password);
    const userObject: PasswordUser = {
      userInfo: {
        userId: 0,
        username: validatedRequest.username,
        nickname: validatedRequest.nickname,
      },
      password: hash,
    };

    let response: CreateUserResponse;
    try {
      response = await this.createUser(userObject);
    } catch (err) {
      return RegisterHandler.buildErrorResponse(
        RegisterErrorCode.REGISTER_ERROR_INTERNAL_ERROR,
        'An internal error occurred',
      );
    }

    if (response.errorMessage !== '') {
      return RegisterHandler.buildErrorResponse(
        RegisterErrorCode.REGISTER_ERROR_INTERNAL_ERROR,
        'An internal error occurred',
      );
    }

    if (!response.user) {
      return RegisterHandler.buildErrorResponse(
        RegisterErrorCode.REGISTER_ERROR_USERNAME_EXISTS,
        'A user with the same username already exists',
      );
    }

    return getHeaderlessResponse({
      errorCode: RegisterErrorCode.REGISTER_ERROR_NONE,
      errorMessage: '',
    });
  }

  static validateRequest(request: RegisterRequest): (ValidatedRequest | Error) {
    if (!request.credentials) {
      return new Error('No credentials provided');
    }

    const username = request.credentials.username.trim();
    const password = request.credentials.password.trim();
    const nickname = request.nickname.trim();

    if (Validator.isEmpty(username) || Validator.isEmpty(password) || Validator.isEmpty(nickname)) {
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
      nickname,
    };
  }

  async createUser(user: PasswordUser): Promise<CreateUserResponse> {
    const request: CreateUserRequest = {
      user,
    };
    const createResult = await this.rpcLoopback.client.createUser(request);
    return createResult;
  }

  static buildErrorResponse(errorCode: RegisterErrorCode, errorMessage: string)
    : ApiResponse<RegisterResponse> {
    return getHeaderlessResponse({
      errorCode,
      errorMessage,
    });
  }
}

type ValidatedRequest = {
  username: string,
  password: string,
  nickname: string,
};

export default RegisterHandler;
