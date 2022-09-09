import { ChannelCredentials, ServiceDefinition } from '@grpc/grpc-js';
import { QueueServiceClient } from '../proto/matching-service.grpc-client';
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
    const grpcClient = new QueueServiceClient(
      '127.0.0.1:4000',
      ChannelCredentials.createInsecure(),
      {},
      {},
    );

    const handlerDefinitions: ServiceHandlerDefinition<IQueueService> = {
      joinQueue: fromApiHandler(
        new JoinQueueHandler(grpcClient, authService),
        JoinQueueRequest,
        JoinQueueResponse,
      ),
      checkQueueStatus: fromApiHandler(
        new CheckQueueStatusHandler(grpcClient, authService),
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
