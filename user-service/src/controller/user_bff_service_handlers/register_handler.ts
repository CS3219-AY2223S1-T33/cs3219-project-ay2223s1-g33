import bcrypt from 'bcrypt';
import { RegisterErrorCode, RegisterRequest, RegisterResponse } from '../../proto/user-bff-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { UserServiceClient } from '../../proto/user-service.grpc-client';
import { PasswordUser } from '../../proto/types';
import { CreateUserResponse } from '../../proto/user-service';

class RegisterHandler implements IApiHandler<RegisterRequest, RegisterResponse> {
  rpcClient: UserServiceClient;

  constructor(rpcClient: UserServiceClient) {
    this.rpcClient = rpcClient;
  }

  async handle(request: RegisterRequest): Promise<RegisterResponse> {
    if (!request.credentials) {
      return {
        errorCode: RegisterErrorCode.REGISTER_ERROR_BAD_REQUEST,
        errorMessage: 'No credentials provided',
      };
    }

    if (
      request.credentials.username.trim() === ''
      || request.credentials.password.trim() === ''
      || request.nickname.trim() === ''
    ) {
      return {
        errorCode: RegisterErrorCode.REGISTER_ERROR_BAD_REQUEST,
        errorMessage: 'Empty field provided',
      };
    }

    const hash = await bcrypt.hash(request.credentials.password, 8);
    const userObject: PasswordUser = {
      userInfo: {
        userId: 0,
        username: request.credentials.username,
        nickname: request.nickname,
      },
      password: hash,
    };
    const createUserOperation = new Promise<CreateUserResponse>((resolve, reject) => {
      this.rpcClient.createUser(
        {
          user: userObject,
        },
        (err, value) => {
          if (value) {
            resolve(value);
          }
          reject(err);
        },
      );
    });

    let response: CreateUserResponse;
    try {
      response = await createUserOperation;
    } catch (err) {
      return {
        errorCode: RegisterErrorCode.REGISTER_ERROR_INTERNAL_ERROR,
        errorMessage: 'An internal error occurred',
      };
    }

    if (!response.user) {
      return {
        errorCode: RegisterErrorCode.REGISTER_ERROR_USERNAME_EXISTS,
        errorMessage: 'A user with the same username already exists',
      };
    }

    return {
      errorCode: RegisterErrorCode.REGISTER_ERROR_NONE,
      errorMessage: '',
    };
  }
}

export default RegisterHandler;
