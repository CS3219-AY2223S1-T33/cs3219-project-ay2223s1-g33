import { ServiceDefinition } from '@grpc/grpc-js';

import { IQueueService, queueServiceDefinition } from '../proto/matching-service.grpc-server';
import {
  JoinQueueRequest,
  JoinQueueResponse,
  CheckQueueStatusRequest,
  CheckQueueStatusResponse,
  LeaveQueueRequest,
  LeaveQueueResponse,
} from '../proto/matching-service';
import { ServiceHandlerDefinition, ApiService } from '../api_server/api_server_types';
import { fromApiHandler } from '../api_server/api_server_helpers';
import JoinQueueHandler from './matching_service_handlers/join_queue_handler';
import CheckQueueStatusHandler from './matching_service_handlers/check_status_handler';
import { IRedisMatchingAdapter } from '../redis_adapter/redis_matching_adapter';
import { IRoomSessionAgent } from '../room_auth/room_session_agent_types';
import LeaveQueueHandler from './matching_service_handlers/leave_queue_handler';

class MatchingServiceApi implements ApiService<IQueueService> {
  serviceHandlerDefinition: ServiceHandlerDefinition<IQueueService>;

  serviceDefinition: ServiceDefinition<IQueueService>;

  serviceImplementation: IQueueService;

  constructor(
    roomAuthService: IRoomSessionAgent,
    redisAdapter: IRedisMatchingAdapter,
  ) {
    const handlerDefinitions: ServiceHandlerDefinition<IQueueService> = {
      joinQueue: fromApiHandler(
        new JoinQueueHandler(redisAdapter),
        JoinQueueRequest,
        JoinQueueResponse,
      ),
      checkQueueStatus: fromApiHandler(
        new CheckQueueStatusHandler(roomAuthService, redisAdapter),
        CheckQueueStatusRequest,
        CheckQueueStatusResponse,
      ),
      leaveQueue: fromApiHandler(
        new LeaveQueueHandler(redisAdapter),
        LeaveQueueRequest,
        LeaveQueueResponse,
      ),
    };

    const matchingQueueService: IQueueService = {
      checkQueueStatus: handlerDefinitions.checkQueueStatus.grpcRouteHandler,
      joinQueue: handlerDefinitions.joinQueue.grpcRouteHandler,
      leaveQueue: handlerDefinitions.leaveQueue.grpcRouteHandler,
    };

    this.serviceHandlerDefinition = handlerDefinitions;
    this.serviceDefinition = queueServiceDefinition;
    this.serviceImplementation = matchingQueueService;
  }
}

export default MatchingServiceApi;
