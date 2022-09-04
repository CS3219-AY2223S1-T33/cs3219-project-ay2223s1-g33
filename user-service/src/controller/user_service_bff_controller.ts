import { ServiceDefinition, ChannelCredentials } from '@grpc/grpc-js';
import { IUserBFFService, userBFFServiceDefinition } from '../proto/user-bff-service.grpc-server';
import { ServiceHandlerDefinition, ApiService } from '../api_server/api_server_types';
import { fromApiHandler } from '../api_server/api_server_helpers';
import { UserServiceClient } from '../proto/user-service.grpc-client';
import RegisterHandler from './user_bff_service_handlers/register_handler';
import {
  GetUserProfileRequest,
  GetUserProfileResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
} from '../proto/user-bff-service';
import LoginHandler from './user_bff_service_handlers/login_handler';
import { IAuthenticationAgent } from '../auth/authentication_agent_types';
import LogoutHandler from './user_bff_service_handlers/logout_handler';
import GetUserProfileHandler from './user_bff_service_handlers/get_user_profile_handler';

class UserBFFServiceApi implements ApiService<IUserBFFService> {
  serviceHandlerDefinition: ServiceHandlerDefinition<IUserBFFService>;

  serviceDefinition: ServiceDefinition<IUserBFFService>;

  serviceImplementation: IUserBFFService;

  constructor(authService: IAuthenticationAgent) {
    const grpcClient = new UserServiceClient(
      '127.0.0.1:4000',
      ChannelCredentials.createInsecure(),
      {},
      {},
    );

    const handlerDefinitions: ServiceHandlerDefinition<IUserBFFService> = {
      register: fromApiHandler(new RegisterHandler(grpcClient), RegisterRequest, RegisterResponse),
      login: fromApiHandler(new LoginHandler(grpcClient, authService), LoginRequest, LoginResponse),
      logout: fromApiHandler(new LogoutHandler(authService), LogoutRequest, LogoutResponse),
      getUserProfile: fromApiHandler(
        new GetUserProfileHandler(grpcClient, authService),
        GetUserProfileRequest,
        GetUserProfileResponse,
      ),
    };

    const userBFFService: IUserBFFService = {
      register: handlerDefinitions.register.grpcRouteHandler,
      login: handlerDefinitions.login.grpcRouteHandler,
      logout: handlerDefinitions.logout.grpcRouteHandler,
      getUserProfile: handlerDefinitions.getUserProfile.grpcRouteHandler,
    };

    this.serviceHandlerDefinition = handlerDefinitions;
    this.serviceDefinition = userBFFServiceDefinition;
    this.serviceImplementation = userBFFService;
  }
}

export default UserBFFServiceApi;
