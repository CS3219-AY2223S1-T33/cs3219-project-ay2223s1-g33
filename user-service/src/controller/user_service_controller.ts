import { ServiceDefinition, ChannelCredentials } from '@grpc/grpc-js';
import { IUserService, userServiceDefinition } from '../proto/user-service.grpc-server';
import { ServiceHandlerDefinition, ApiService } from '../api_server/api_server_types';
import { fromApiHandler } from '../api_server/api_server_helpers';
import { UserCrudServiceClient } from '../proto/user-crud-service.grpc-client';
import RegisterHandler from './user_service_handlers/register_handler';
import {
  GetUserProfileRequest,
  GetUserProfileResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
} from '../proto/user-service';
import LoginHandler from './user_service_handlers/login_handler';
import { IAuthenticationAgent } from '../auth/authentication_agent_types';
import LogoutHandler from './user_service_handlers/logout_handler';
import GetUserProfileHandler from './user_service_handlers/get_user_profile_handler';

class UserBFFServiceApi implements ApiService<IUserService> {
  serviceHandlerDefinition: ServiceHandlerDefinition<IUserService>;

  serviceDefinition: ServiceDefinition<IUserService>;

  serviceImplementation: IUserService;

  constructor(authService: IAuthenticationAgent) {
    const grpcClient = new UserCrudServiceClient(
      '127.0.0.1:4000',
      ChannelCredentials.createInsecure(),
      {},
      {},
    );

    const handlerDefinitions: ServiceHandlerDefinition<IUserService> = {
      register: fromApiHandler(new RegisterHandler(grpcClient), RegisterRequest, RegisterResponse),
      login: fromApiHandler(new LoginHandler(grpcClient, authService), LoginRequest, LoginResponse),
      logout: fromApiHandler(new LogoutHandler(authService), LogoutRequest, LogoutResponse),
      getUserProfile: fromApiHandler(
        new GetUserProfileHandler(grpcClient, authService),
        GetUserProfileRequest,
        GetUserProfileResponse,
      ),
    };

    const userService: IUserService = {
      register: handlerDefinitions.register.grpcRouteHandler,
      login: handlerDefinitions.login.grpcRouteHandler,
      logout: handlerDefinitions.logout.grpcRouteHandler,
      getUserProfile: handlerDefinitions.getUserProfile.grpcRouteHandler,
    };

    this.serviceHandlerDefinition = handlerDefinitions;
    this.serviceDefinition = userServiceDefinition;
    this.serviceImplementation = userService;
  }
}

export default UserBFFServiceApi;
