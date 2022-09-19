import { ServiceDefinition, UntypedServiceImplementation } from '@grpc/grpc-js';
import {
  collabTunnelServiceDefinition,
  ICollabTunnelService,
} from '../proto/collab-service.grpc-server';
import {
  CollabTunnelRequest,
  CollabTunnelResponse,
  VerifyRoomErrorCode,
} from '../proto/collab-service';
import CollabTunnelPubSub from '../pub_sub/collab_tunnel_pubsub';
import loadEnvironment from '../utils/env_loader';
import createRoomSessionService from '../room_auth/room_session_agent';

const envConfig = loadEnvironment();

// Central source of pubsub
const pubSub = new CollabTunnelPubSub();
const roomService = createRoomSessionService(envConfig.JWT_ROOM_SECRET);

function buildErrorResponse(errorCode: VerifyRoomErrorCode): CollabTunnelResponse {
  const emptyByte = new Uint8Array(0);
  return {
    data: emptyByte,
    flags: errorCode,
  };
}

async function pubSubOpenStream(call: any) {
  // When stream opens
  const roomToken = call.metadata.get('roomToken')[0];
  const username = call.metadata.get('username')[0];
  const roomId = await roomService.verifyToken(roomToken);
  if (!roomId) {
    // Kill stream when invalid
    const errMsg = buildErrorResponse(VerifyRoomErrorCode.VERIFY_ROOM_UNAUTHORIZED);
    call.write(errMsg);
    // call.end();
    // return;
  }
  const cTopic = pubSub.createTopic(roomId);
  cTopic?.createSubscription(username, call);

  // When data is detected
  call.on('data', (request: CollabTunnelRequest) => {
    cTopic?.push(request, username);
  });

  // When stream closes
  call.on('end', () => {
    pubSub.clean(call);
    call.end();
  });
}

class CollabTunnelStream {
  public serviceDefinition: ServiceDefinition<ICollabTunnelService>;

  public serviceImplementation: UntypedServiceImplementation;

  constructor() {
    this.serviceDefinition = collabTunnelServiceDefinition;
    this.serviceImplementation = {
      OpenStream: pubSubOpenStream,
    };
  }
}

export default CollabTunnelStream;
