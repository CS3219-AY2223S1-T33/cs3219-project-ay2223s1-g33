import { ServiceDefinition } from '@grpc/grpc-js';
import { IHistoryService, historyServiceDefinition } from '../proto/history-service.grpc-server';
import { ServiceHandlerDefinition, ApiService } from '../api_server/api_server_types';
import { fromApiHandler } from '../api_server/api_server_helpers';
import GetAttemptHistoryHandler from './history_service_handlers/get_attempt_history_handler';
import { IHistoryCrudService } from '../proto/history-crud-service.grpc-server';
import {
  SetHistoryCompletionRequest,
  SetHistoryCompletionResponse,
  GetAttemptHistoryRequest,
  GetAttemptHistoryResponse,
  GetAttemptSubmissionRequest,
  GetAttemptSubmissionResponse,
} from '../proto/history-service';
import GetAttemptSubmissionHandler from './history_service_handlers/get_attempt_submission_handler';
import { ILoopbackServiceChannel } from '../api_server/loopback_server_types';
import SetHistoryCompletionHandler
  from './history_service_handlers/create_completion_submission_handler';

class HistoryServiceApi implements ApiService<IHistoryService> {
  serviceHandlerDefinition: ServiceHandlerDefinition<IHistoryService>;

  serviceDefinition: ServiceDefinition<IHistoryService>;

  constructor(crudLoopback: ILoopbackServiceChannel<IHistoryCrudService>) {
    const handlerDefinitions: ServiceHandlerDefinition<IHistoryService> = {
      getAttemptHistory: fromApiHandler(
        new GetAttemptHistoryHandler(crudLoopback),
        GetAttemptHistoryRequest,
        GetAttemptHistoryResponse,
      ),
      getAttemptSubmission: fromApiHandler(
        new GetAttemptSubmissionHandler(crudLoopback),
        GetAttemptSubmissionRequest,
        GetAttemptSubmissionResponse,
      ),
      setHistoryCompletion: fromApiHandler(
        new SetHistoryCompletionHandler(crudLoopback),
        SetHistoryCompletionRequest,
        SetHistoryCompletionResponse,
      ),
    };

    this.serviceHandlerDefinition = handlerDefinitions;
    this.serviceDefinition = historyServiceDefinition;
  }
}

export default HistoryServiceApi;
