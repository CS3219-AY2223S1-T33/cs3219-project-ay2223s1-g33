import { ServiceDefinition } from '@grpc/grpc-js';
import { ICollabService, collabServiceDefinition } from '../proto/collab-service.grpc-server';
import {
  VerifyRoomRequest,
  VerifyRoomResponse,
} from '../proto/collab-service';
import { ServiceHandlerDefinition, ApiService } from '../api_server/api_server_types';
import { fromApiHandler } from '../api_server/api_server_helpers';
import VerifyCollabHandler from './collab_service_handlers/verify_collab_handler';
import { IAuthenticationAgent } from '../auth/authentication_agent_types';
import { IRoomSessionAgent } from '../room_auth/room_session_agent_types';

class CollabServiceApi implements ApiService<ICollabService> {
  serviceHandlerDefinition: ServiceHandlerDefinition<ICollabService>;

  serviceDefinition: ServiceDefinition<ICollabService>;

  serviceImplementation: ICollabService;

  constructor(userAuthService: IAuthenticationAgent, roomAuthService: IRoomSessionAgent) {
    const handlerDefinitions: ServiceHandlerDefinition<ICollabService> = {
      verifyRoom: fromApiHandler(
        new VerifyCollabHandler(userAuthService, roomAuthService),
        VerifyRoomRequest,
        VerifyRoomResponse,
      ),
    };

    const collabService: ICollabService = {
      verifyRoom: handlerDefinitions.verifyRoom.grpcRouteHandler,
    };

    this.serviceHandlerDefinition = handlerDefinitions;
    this.serviceDefinition = collabServiceDefinition;
    this.serviceImplementation = collabService;
  }
}

export default CollabServiceApi;
