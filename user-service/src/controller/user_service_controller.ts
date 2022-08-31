import { ServiceDefinition } from '@grpc/grpc-js';
import { IUserService, userServiceDefinition } from '../proto/user-service.grpc-server';
import {
  CreateUserRequest,
  CreateUserResponse,
  DeleteUserRequest,
  DeleteUserResponse,
  EditUserRequest,
  EditUserResponse,
  GetUserRequest,
  GetUserResponse,
} from '../proto/user-service';
import { ServiceHandlerDefinition, ApiService } from '../api_server/api_server_types';
import { fromApiHandler } from '../api_server/api_server_helpers';
import GetUserHandler from './user_service_handlers/get_user_handler';
import { IStorage } from '../storage/storage.d';
import CreateUserHandler from './user_service_handlers/create_user_handler';
import EditUserHandler from './user_service_handlers/edit_user_handler';
import DeleteUserHandler from './user_service_handlers/delete_user_handler';

class UserServiceApi implements ApiService<IUserService> {
  serviceHandlerDefinition: ServiceHandlerDefinition<IUserService>;

  serviceDefinition: ServiceDefinition<IUserService>;

  serviceImplementation: IUserService;

  constructor(storage: IStorage) {
    const handlerDefinitions: ServiceHandlerDefinition<IUserService> = {
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
    };

    const userService: IUserService = {
      getUser: handlerDefinitions.getUser.grpcRouteHandler,
      createUser: handlerDefinitions.createUser.grpcRouteHandler,
      editUser: handlerDefinitions.editUser.grpcRouteHandler,
      deleteUser: handlerDefinitions.deleteUser.grpcRouteHandler,
    };

    this.serviceHandlerDefinition = handlerDefinitions;
    this.serviceDefinition = userServiceDefinition;
    this.serviceImplementation = userService;
  }
}

export default UserServiceApi;
