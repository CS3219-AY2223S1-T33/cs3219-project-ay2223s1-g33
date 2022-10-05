import { ServiceDefinition, ChannelCredentials } from '@grpc/grpc-js';
import { IHistoryCrudService, historyCrudServiceDefinition } from '../proto/history-crud-service.grpc-server';
import {
  CreateAttemptRequest,
  CreateAttemptResponse,
  DeleteAttemptRequest,
  DeleteAttemptResponse,
  GetAttemptRequest,
  GetAttemptResponse,
  GetAttemptsRequest,
  GetAttemptsResponse,
} from '../proto/history-crud-service';
import { ServiceHandlerDefinition, ApiService } from '../api_server/api_server_types';
import { fromApiHandler } from '../api_server/api_server_helpers';
import GetAttemptHandler from './history_crud_service_handlers/get_attempt_handler';
import GetAttemptsHandler from './history_crud_service_handlers/get_attempts_handler';
import { IStorage } from '../storage/storage';
import CreateAttemptHandler from './history_crud_service_handlers/create_attempt_handler';
import DeleteAttemptHandler from './history_crud_service_handlers/delete_attempt_handler';
import { UserCrudServiceClient } from '../proto/user-crud-service.grpc-client';

class HistoryCrudServiceApi implements ApiService<IHistoryCrudService> {
  serviceHandlerDefinition: ServiceHandlerDefinition<IHistoryCrudService>;

  serviceDefinition: ServiceDefinition<IHistoryCrudService>;

  serviceImplementation: IHistoryCrudService;

  constructor(storage: IStorage, userServiceUrl: string) {
    const grpcClient = new UserCrudServiceClient(
      userServiceUrl,
      ChannelCredentials.createInsecure(),
      {},
      {},
    );

    const handlerDefinitions: ServiceHandlerDefinition<IHistoryCrudService> = {
      getAttempt: fromApiHandler(
        new GetAttemptHandler(storage),
        GetAttemptRequest,
        GetAttemptResponse,
      ),
      getAttempts: fromApiHandler(
        new GetAttemptsHandler(storage),
        GetAttemptsRequest,
        GetAttemptsResponse,
      ),
      createAttempt: fromApiHandler(
        new CreateAttemptHandler(storage, grpcClient),
        CreateAttemptRequest,
        CreateAttemptResponse,
      ),
      deleteAttempt: fromApiHandler(
        new DeleteAttemptHandler(storage),
        DeleteAttemptRequest,
        DeleteAttemptResponse,
      ),
    };

    const historyCrudService: IHistoryCrudService = {
      getAttempt: handlerDefinitions.getAttempt.grpcRouteHandler,
      getAttempts: handlerDefinitions.getAttempts.grpcRouteHandler,
      createAttempt: handlerDefinitions.createAttempt.grpcRouteHandler,
      deleteAttempt: handlerDefinitions.deleteAttempt.grpcRouteHandler,
    };

    this.serviceHandlerDefinition = handlerDefinitions;
    this.serviceDefinition = historyCrudServiceDefinition;
    this.serviceImplementation = historyCrudService;
  }
}

export default HistoryCrudServiceApi;