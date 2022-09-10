import { ServiceDefinition } from '@grpc/grpc-js';
import { IQueueService, queueServiceDefinition } from '../proto/matching-service.grpc-server';
import {
  JoinQueueRequest,
  JoinQueueResponse,
  CheckQueueStatusRequest,
  CheckQueueStatusResponse,
} from '../proto/matching-service';
import { ServiceHandlerDefinition, ApiService } from '../api_server/api_server_types';
import { fromApiHandler } from '../api_server/api_server_helpers';
import JoinQueueHandler from './matching_service_handlers/join_queue_handler';
import CheckQueueStatusHandler from './matching_service_handlers/check_status_handler';
import { IAuthenticationAgent } from '../auth/authentication_agent_types';

class MatchingServiceApi implements ApiService<IQueueService> {
  serviceHandlerDefinition: ServiceHandlerDefinition<IQueueService>;

  serviceDefinition: ServiceDefinition<IQueueService>;

  serviceImplementation: IQueueService;

  constructor(authService: IAuthenticationAgent) {
    const handlerDefinitions: ServiceHandlerDefinition<IQueueService> = {
      joinQueue: fromApiHandler(
        new JoinQueueHandler(authService),
        JoinQueueRequest,
        JoinQueueResponse,
      ),
      checkQueueStatus: fromApiHandler(
        new CheckQueueStatusHandler(authService),
        CheckQueueStatusRequest,
        CheckQueueStatusResponse,
      ),
    };

    const matchingQueueService: IQueueService = {
      checkQueueStatus: handlerDefinitions.joinQueue.grpcRouteHandler,
      joinQueue: handlerDefinitions.checkQueueStatus.grpcRouteHandler,
    };

    this.serviceHandlerDefinition = handlerDefinitions;
    this.serviceDefinition = queueServiceDefinition;
    this.serviceImplementation = matchingQueueService;
  }
}

export default MatchingServiceApi;
