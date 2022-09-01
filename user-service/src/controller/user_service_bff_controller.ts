import { ServiceDefinition, ChannelCredentials } from '@grpc/grpc-js';
import { IUserBFFService, userBFFServiceDefinition } from '../proto/user-bff-service.grpc-server';
import { ServiceHandlerDefinition, ApiService } from '../api_server/api_server_types';
import { fromApiHandler } from '../api_server/api_server_helpers';
import { UserServiceClient } from '../proto/user-service.grpc-client';
import RegisterHandler from './user_bff_service_handlers/register_handler';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from '../proto/user-bff-service';
import LoginHandler from './user_bff_service_handlers/login_handler';

class UserBFFServiceApi implements ApiService<IUserBFFService> {
  serviceHandlerDefinition: ServiceHandlerDefinition<IUserBFFService>;

  serviceDefinition: ServiceDefinition<IUserBFFService>;

  serviceImplementation: IUserBFFService;

  constructor() {
    const grpcClient = new UserServiceClient(
      '127.0.0.1:4000',
      ChannelCredentials.createInsecure(),
      {},
      {},
    );

    const handlerDefinitions: ServiceHandlerDefinition<IUserBFFService> = {
      register: fromApiHandler(new RegisterHandler(grpcClient), RegisterRequest, RegisterResponse),
      login: fromApiHandler(new LoginHandler(grpcClient), LoginRequest, LoginResponse),
    };

    const userBFFService: IUserBFFService = {
      register: handlerDefinitions.register.grpcRouteHandler,
      login: handlerDefinitions.login.grpcRouteHandler,
    };

    this.serviceHandlerDefinition = handlerDefinitions;
    this.serviceDefinition = userBFFServiceDefinition;
    this.serviceImplementation = userBFFService;
  }
}

export default UserBFFServiceApi;
