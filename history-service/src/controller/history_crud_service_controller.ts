import { ServiceDefinition, ChannelCredentials } from '@grpc/grpc-js';
import { IHistoryCrudService, historyCrudServiceDefinition } from '../proto/history-crud-service.grpc-server';
import {
  CreateAttemptRequest,
  CreateAttemptResponse, CreateCompletionRequest, CreateCompletionResponse,
  DeleteAttemptRequest,
  DeleteAttemptResponse,
  GetAttemptRequest,
  GetAttemptResponse,
  GetAttemptsRequest,
  GetAttemptsResponse,
  GetCompletionRequest,
  GetCompletionResponse,
} from '../proto/history-crud-service';
import { ServiceHandlerDefinition, ApiService } from '../api_server/api_server_types';
import { fromApiHandler } from '../api_server/api_server_helpers';
import GetAttemptHandler from './history_crud_service_handlers/get_attempt_handler';
import GetAttemptsHandler from './history_crud_service_handlers/get_attempts_handler';
import { IStorage } from '../storage/storage';
import CreateAttemptHandler from './history_crud_service_handlers/create_attempt_handler';
import DeleteAttemptHandler from './history_crud_service_handlers/delete_attempt_handler';
import { UserCrudServiceClient } from '../proto/user-crud-service.grpc-client';
import { QuestionServiceClient } from '../proto/question-service.grpc-client';
import CreateCompletionHandler from './history_crud_service_handlers/create_completion_handler';
import GetCompletionHandler from './history_crud_service_handlers/get_completion_handler';

class HistoryCrudServiceApi implements ApiService<IHistoryCrudService> {
  serviceHandlerDefinition: ServiceHandlerDefinition<IHistoryCrudService>;

  serviceDefinition: ServiceDefinition<IHistoryCrudService>;

  constructor(storage: IStorage, userServiceUrl: string, questionServiceUrl: string) {
    const userGrpcClient = new UserCrudServiceClient(
      userServiceUrl,
      ChannelCredentials.createInsecure(),
      {},
      {},
    );

    const questionGrpcClient = new QuestionServiceClient(
      questionServiceUrl,
      ChannelCredentials.createInsecure(),
      {},
      {},
    );

    const handlerDefinitions: ServiceHandlerDefinition<IHistoryCrudService> = {
      getAttempt: fromApiHandler(
        new GetAttemptHandler(storage, userGrpcClient, questionGrpcClient),
        GetAttemptRequest,
        GetAttemptResponse,
      ),
      getAttempts: fromApiHandler(
        new GetAttemptsHandler(storage, userGrpcClient, questionGrpcClient),
        GetAttemptsRequest,
        GetAttemptsResponse,
      ),
      createAttempt: fromApiHandler(
        new CreateAttemptHandler(storage, userGrpcClient, questionGrpcClient),
        CreateAttemptRequest,
        CreateAttemptResponse,
      ),
      deleteAttempt: fromApiHandler(
        new DeleteAttemptHandler(storage),
        DeleteAttemptRequest,
        DeleteAttemptResponse,
      ),
      createCompletion: fromApiHandler(
        new CreateCompletionHandler(storage, userGrpcClient, questionGrpcClient),
        CreateCompletionRequest,
        CreateCompletionResponse,
      ),
      getCompletion: fromApiHandler(
        new GetCompletionHandler(storage, userGrpcClient, questionGrpcClient),
        GetCompletionRequest,
        GetCompletionResponse,
      ),
    };

    this.serviceHandlerDefinition = handlerDefinitions;
    this.serviceDefinition = historyCrudServiceDefinition;
  }
}

export default HistoryCrudServiceApi;
