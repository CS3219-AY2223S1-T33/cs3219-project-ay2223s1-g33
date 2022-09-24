import { ServiceDefinition, UntypedServiceImplementation } from '@grpc/grpc-js';
import { createClient, RedisClientType } from 'redis';
import {
  collabTunnelServiceDefinition,
  ICollabTunnelService,
} from '../proto/collab-service.grpc-server';
import buildErrorResponse from '../controller/collab_response';
import { createRedisPubSubAdapter } from '../redis_adapter/redis_pubsub_adapter';
import createRoomSessionService from '../room_auth/room_session_agent';
import loadEnvironment from '../utils/env_loader';

const envConfig = loadEnvironment();

const pub: RedisClientType = createClient({
  url: envConfig.REDIS_SERVER_URL,
});

const sub: RedisClientType = createClient({
  url: envConfig.REDIS_SERVER_URL,
});

pub.connect();
sub.connect();

const roomService = createRoomSessionService(envConfig.JWT_ROOM_SECRET);

async function pubSubOpenStream(call: any) {
  // When stream opens
  const roomToken = call.metadata.get('roomToken')[0];
  const username = call.metadata.get('username')[0];
  const roomId = await roomService.verifyToken(roomToken);
  if (!roomId) {
    // Kill stream when invalid
    const errMsg = buildErrorResponse();
    call.write(errMsg);
    call.end();
    return;
  }

  const redisPubSubAdapter = createRedisPubSubAdapter(pub, sub, username, roomId);
  await redisPubSubAdapter.registerEvent(call);

  // When data is detected
  call.on('data', (request: any) => {
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
