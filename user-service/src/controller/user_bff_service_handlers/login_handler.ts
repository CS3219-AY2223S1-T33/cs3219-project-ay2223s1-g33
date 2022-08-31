import { LoginRequest, LoginResponse } from '../../proto/user-bff-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { UserServiceClient } from '../../proto/user-service.grpc-client';

class LoginHandler implements IApiHandler<LoginRequest, LoginResponse> {
  rpcClient: UserServiceClient;

  constructor(rpcClient: UserServiceClient) {
    this.rpcClient = rpcClient;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  async handle(request: LoginRequest): Promise<LoginResponse> {
    return LoginResponse.create();
  }
}

export default LoginHandler;
