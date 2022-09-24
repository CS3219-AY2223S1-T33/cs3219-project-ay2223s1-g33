import { ServiceDefinition, UntypedServiceImplementation } from '@grpc/grpc-js';
import { createClient, RedisClientType } from 'redis';
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
import { createRedisPubSubAdapter } from '../redis_adapter/redis_pubsub_adapter';

const envConfig = loadEnvironment();
const roomService = createRoomSessionService(envConfig.JWT_ROOM_SECRET);

function buildErrorResponse(errorCode: VerifyRoomErrorCode): CollabTunnelResponse {
  const emptyByte = new Uint8Array(0);
  return {
    data: emptyByte,
    flags: errorCode,
  };
}

const pub: RedisClientType = createClient({
  url: envConfig.REDIS_SERVER_URL,
});
const sub: RedisClientType = createClient({
  url: envConfig.REDIS_SERVER_URL,
});
pub.connect();
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

  const redisPubSubAdapter = createRedisPubSubAdapter(pub, sub, username, roomId);
  await redisPubSubAdapter.registerEvent(call);

  // When data is detected
  call.on('data', (request: CollabTunnelRequest) => {
    redisPubSubAdapter.push(request);
  });

  // When stream closes
  call.on('end', () => {
    redisPubSubAdapter.clean(call);
  });
}

class CollabTunnelPubSub {
  public serviceDefinition: ServiceDefinition<ICollabTunnelService>;

  public serviceImplementation: UntypedServiceImplementation;

  constructor() {
    this.serviceDefinition = collabTunnelServiceDefinition;
    this.serviceImplementation = {
      OpenStream: pubSubOpenStream,
    };
  }
}

export default CollabTunnelPubSub;
