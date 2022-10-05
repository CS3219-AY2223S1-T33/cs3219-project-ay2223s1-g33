import { ServiceDefinition } from '@grpc/grpc-js';
import { IUserService, userServiceDefinition } from '../proto/user-service.grpc-server';
import { ServiceHandlerDefinition, ApiService, ILoopbackServiceChannel } from '../api_server/api_server_types';
import { fromApiHandler } from '../api_server/api_server_helpers';
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
import { IUserCrudService } from '../proto/user-crud-service.grpc-server';

class UserServiceApi implements ApiService<IUserService> {
  serviceHandlerDefinition: ServiceHandlerDefinition<IUserService>;

  serviceDefinition: ServiceDefinition<IUserService>;

  serviceImplementation: IUserService;

  constructor(
    authService: IAuthenticationAgent,
    crudLoopback: ILoopbackServiceChannel<IUserCrudService>,
  ) {
    const handlerDefinitions: ServiceHandlerDefinition<IUserService> = {
      register: fromApiHandler(
        new RegisterHandler(crudLoopback),
        RegisterRequest,
        RegisterResponse,
      ),
      login: fromApiHandler(
        new LoginHandler(crudLoopback, authService),
        LoginRequest,
        LoginResponse,
      ),
      logout: fromApiHandler(
        new LogoutHandler(authService),
        LogoutRequest,
        LogoutResponse,
      ),
      getUserProfile: fromApiHandler(
        new GetUserProfileHandler(crudLoopback, authService),
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

export default UserServiceApi;
