import { ServiceDefinition, UntypedServiceImplementation } from '@grpc/grpc-js';
import { createClient } from 'redis';
import {
  collabTunnelServiceDefinition,
  ICollabTunnelService,
} from '../proto/collab-service.grpc-server';
import {
  CollabTunnelRequest,
  CollabTunnelResponse,
  VerifyRoomErrorCode,
} from '../proto/collab-service';
import loadEnvironment from '../utils/env_loader';
import createRoomSessionService from '../room_auth/room_session_agent';
// import Logger from '../utils/logger';

const envConfig = loadEnvironment();
const roomService = createRoomSessionService(envConfig.JWT_ROOM_SECRET);

function buildErrorResponse(errorCode: VerifyRoomErrorCode): CollabTunnelResponse {
  const emptyByte = new Uint8Array(0);
  return {
    data: emptyByte,
    flags: errorCode,
  };
}

const pub = createClient({
  url: envConfig.REDIS_SERVER_URL,
});
pub.connect();
const sub = createClient({
  url: envConfig.REDIS_SERVER_URL,
});
sub.connect();

async function pubSubOpenStream(call: any) {
  // When stream opens
  const roomToken = call.metadata.get('roomToken')[0];
  const username = call.metadata.get('username')[0];
  const roomId = await roomService.verifyToken(roomToken);
  if (!roomId) {
    // Kill stream when invalid
    const errMsg = buildErrorResponse(VerifyRoomErrorCode.VERIFY_ROOM_UNAUTHORIZED);
    call.write(errMsg);
    call.end();
    return;
  }

  // @ts-ignore
  sub.subscribe(`chat-${roomId}`, (message) => {
    const data = JSON.parse(message);
    const response = CollabTunnelResponse.create(
      {
        data: Buffer.from(data.data.data),
        flags: VerifyRoomErrorCode.VERIFY_ROOM_ERROR_NONE,
      },
    );
    console.log(`recipient-${username}`);
    console.log(response);
    call.write(response);
  });

  // When data is detected
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  call.on('data', (request: CollabTunnelRequest) => {
    // pub.push(roomId, request);
    pub.publish(`chat-${roomId}`, JSON.stringify(request));
    console.log(`sender-${username}`);
    console.log(request);
  });

  // When stream closes
  call.on('end', () => {
    call.end();
  });
}

class CollabPubSubStream {
  public serviceDefinition: ServiceDefinition<ICollabTunnelService>;

  public serviceImplementation: UntypedServiceImplementation;

  constructor() {
    this.serviceDefinition = collabTunnelServiceDefinition;
    this.serviceImplementation = {
      OpenStream: pubSubOpenStream,
    };
  }
}

export default CollabPubSubStream;
