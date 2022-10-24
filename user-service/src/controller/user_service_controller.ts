import { ServiceDefinition } from '@grpc/grpc-js';
import { IUserService, userServiceDefinition } from '../proto/user-service.grpc-server';
import { ServiceHandlerDefinition, ApiService } from '../api_server/api_server_types';
import { fromApiHandler } from '../api_server/api_server_helpers';
import RegisterHandler from './user_service_handlers/register_handler';
import {
  ChangeNicknameRequest,
  ChangeNicknameResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ConsumeResetTokenRequest,
  ConsumeResetTokenResponse,
  GetUserProfileRequest,
  GetUserProfileResponse,
  LoginRequest,
  LoginResponse,
  LogoutRequest,
  LogoutResponse,
  RegisterRequest,
  RegisterResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '../proto/user-service';
import { IAuthenticationAgent } from '../auth/authentication_agent_types';
import { IUserCrudService } from '../proto/user-crud-service.grpc-server';
import { IEmailSender } from '../email/email_sender';
import createHashAgent from '../auth/hash_agent';
import { ILoopbackServiceChannel } from '../api_server/loopback_server_types';
import LoginHandler from './user_service_handlers/login_handler';
import LogoutHandler from './user_service_handlers/logout_handler';
import GetUserProfileHandler from './user_service_handlers/get_user_profile_handler';
import ResetPasswordHandler from './user_service_handlers/reset_password_handler';
import ConsumeResetTokenHandler from './user_service_handlers/consume_reset_token_handler';
import ChangeNicknameHandler from './user_service_handlers/change_nickname_handler';
import ChangePasswordHandler from './user_service_handlers/change_password_handler';

class UserServiceApi implements ApiService<IUserService> {
  serviceHandlerDefinition: ServiceHandlerDefinition<IUserService>;

  serviceDefinition: ServiceDefinition<IUserService>;

  constructor(
    authService: IAuthenticationAgent,
    emailSender: IEmailSender,
    crudLoopback: ILoopbackServiceChannel<IUserCrudService>,
  ) {
    const hashAgent = createHashAgent();

    const handlerDefinitions: ServiceHandlerDefinition<IUserService> = {
      register: fromApiHandler(
        new RegisterHandler(crudLoopback, hashAgent),
        RegisterRequest,
        RegisterResponse,
      ),
      login: fromApiHandler(
        new LoginHandler(crudLoopback, authService, hashAgent),
        LoginRequest,
        LoginResponse,
      ),
      logout: fromApiHandler(
        new LogoutHandler(authService),
        LogoutRequest,
        LogoutResponse,
      ),
      getUserProfile: fromApiHandler(
        new GetUserProfileHandler(crudLoopback),
        GetUserProfileRequest,
        GetUserProfileResponse,
      ),
      resetPassword: fromApiHandler(
        new ResetPasswordHandler(crudLoopback, emailSender),
        ResetPasswordRequest,
        ResetPasswordResponse,
      ),
      consumeResetToken: fromApiHandler(
        new ConsumeResetTokenHandler(crudLoopback, authService, hashAgent),
        ConsumeResetTokenRequest,
        ConsumeResetTokenResponse,
      ),
      changeNickname: fromApiHandler(
        new ChangeNicknameHandler(crudLoopback),
        ChangeNicknameRequest,
        ChangeNicknameResponse,
      ),
      changePassword: fromApiHandler(
        new ChangePasswordHandler(crudLoopback, authService, hashAgent),
        ChangePasswordRequest,
        ChangePasswordResponse,
      ),
    };

    this.serviceHandlerDefinition = handlerDefinitions;
    this.serviceDefinition = userServiceDefinition;
  }
}

export default UserServiceApi;
