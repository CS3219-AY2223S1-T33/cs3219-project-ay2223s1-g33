import { ServiceDefinition } from '@grpc/grpc-js';
import { IUserCrudService, userCrudServiceDefinition } from '../proto/user-crud-service.grpc-server';
import {
  CreateResetTokenRequest,
  CreateResetTokenResponse,
  CreateUserRequest,
  CreateUserResponse,
  DeleteResetTokenRequest,
  DeleteResetTokenResponse,
  DeleteUserRequest,
  DeleteUserResponse,
  EditUserRequest,
  EditUserResponse,
  GetResetTokensRequest,
  GetResetTokensResponse,
  GetUserRequest,
  GetUserResponse,
} from '../proto/user-crud-service';
import { ServiceHandlerDefinition, ApiService } from '../api_server/api_server_types';
import { fromApiHandler } from '../api_server/api_server_helpers';
import GetUserHandler from './user_crud_service_handlers/get_user_handler';
import { IStorage } from '../storage/storage';
import CreateUserHandler from './user_crud_service_handlers/create_user_handler';
import EditUserHandler from './user_crud_service_handlers/edit_user_handler';
import DeleteUserHandler from './user_crud_service_handlers/delete_user_handler';
import GetResetTokensHandler from './user_crud_service_handlers/get_reset_tokens_handler';
import CreateResetTokenHandler from './user_crud_service_handlers/create_reset_token_handler';
import DeleteResetTokenHandler from './user_crud_service_handlers/delete_reset_token_handler';

class UserCrudServiceApi implements ApiService<IUserCrudService> {
  serviceHandlerDefinition: ServiceHandlerDefinition<IUserCrudService>;

  serviceDefinition: ServiceDefinition<IUserCrudService>;

  serviceImplementation: IUserCrudService;

  constructor(storage: IStorage) {
    const handlerDefinitions: ServiceHandlerDefinition<IUserCrudService> = {
      getUser: fromApiHandler(new GetUserHandler(storage), GetUserRequest, GetUserResponse),
      createUser: fromApiHandler(
        new CreateUserHandler(storage),
        CreateUserRequest,
        CreateUserResponse,
      ),
      editUser: fromApiHandler(new EditUserHandler(storage), EditUserRequest, EditUserResponse),
      deleteUser: fromApiHandler(
        new DeleteUserHandler(storage),
        DeleteUserRequest,
        DeleteUserResponse,
      ),

      getResetTokens: fromApiHandler(
        new GetResetTokensHandler(storage),
        GetResetTokensRequest,
        GetResetTokensResponse,
      ),
      createResetToken: fromApiHandler(
        new CreateResetTokenHandler(storage),
        CreateResetTokenRequest,
        CreateResetTokenResponse,
      ),
      deleteResetToken: fromApiHandler(
        new DeleteResetTokenHandler(storage),
        DeleteResetTokenRequest,
        DeleteResetTokenResponse,
      ),
    };

    const userCrudService: IUserCrudService = {
      getUser: handlerDefinitions.getUser.grpcRouteHandler,
      createUser: handlerDefinitions.createUser.grpcRouteHandler,
      editUser: handlerDefinitions.editUser.grpcRouteHandler,
      deleteUser: handlerDefinitions.deleteUser.grpcRouteHandler,

      getResetTokens: handlerDefinitions.getResetTokens.grpcRouteHandler,
      createResetToken: handlerDefinitions.createResetToken.grpcRouteHandler,
      deleteResetToken: handlerDefinitions.deleteResetToken.grpcRouteHandler,
    };

    this.serviceHandlerDefinition = handlerDefinitions;
    this.serviceDefinition = userCrudServiceDefinition;
    this.serviceImplementation = userCrudService;
  }
}

export default UserCrudServiceApi;
