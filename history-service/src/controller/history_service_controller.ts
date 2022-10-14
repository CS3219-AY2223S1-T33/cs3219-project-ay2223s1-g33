import { ServiceDefinition } from '@grpc/grpc-js';
import { IHistoryService, historyServiceDefinition } from '../proto/history-service.grpc-server';
import { ServiceHandlerDefinition, ApiService, ILoopbackServiceChannel } from '../api_server/api_server_types';
import { fromApiHandler } from '../api_server/api_server_helpers';
import GetAttemptHistoryHandler from './history_service_handlers/get_attempt_history_handler';
import { IHistoryCrudService } from '../proto/history-crud-service.grpc-server';
import {
  GetAttemptHistoryRequest,
  GetAttemptHistoryResponse,
  GetAttemptSubmissionRequest,
  GetAttemptSubmissionResponse,
} from '../proto/history-service';
import GetAttemptSubmissionHandler from './history_service_handlers/get_attempt_submission_handler';

class HistoryServiceApi implements ApiService<IHistoryService> {
  serviceHandlerDefinition: ServiceHandlerDefinition<IHistoryService>;

  serviceDefinition: ServiceDefinition<IHistoryService>;

  serviceImplementation: IHistoryService;

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
    };

    const historyService: IHistoryService = {
      getAttemptHistory: handlerDefinitions.getAttemptHistory.grpcRouteHandler,
      getAttemptSubmission: handlerDefinitions.getAttemptSubmission.grpcRouteHandler,
    };

    this.serviceHandlerDefinition = handlerDefinitions;
    this.serviceDefinition = historyServiceDefinition;
    this.serviceImplementation = historyService;
  }
}

export default HistoryServiceApi;
