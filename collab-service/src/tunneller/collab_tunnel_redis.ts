import { ServiceDefinition } from '@grpc/grpc-js';
import { createClient, RedisClientType } from 'redis';
import {
  collabTunnelServiceDefinition,
  ICollabTunnelService,
} from '../proto/collab-service.grpc-server';
import buildErrorResponse from '../adapter/room_handler';
import { createRedisPubSubAdapter } from '../redis_adapter/redis_pubsub_adapter';
import createRoomSessionService from '../room_auth/room_session_agent';
import loadEnvironment from '../utils/env_loader';
import getQuestionByDifficulty from '../adapter/question_handler';
import setQuestionRedis from '../redis_adapter/redis_question_adapter';
import { CollabTunnelRequest } from '../proto/collab-service';
import { subscriptionListener, createPushStruct } from './collab_tunnel_helper';

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

async function pubSubOpenStream(
  call: any,
) {
  // When stream opens
  const roomToken: string = call.metadata.get('roomToken')[0].toString();
  const username: string = call.metadata.get('username')[0].toString();
  const data = await roomService.verifyToken(roomToken);
  if (!data) {
    // Kill stream when invalid
    const errMsg = buildErrorResponse();
    call.write(errMsg);
    call.end();
    return;
  }
  const { roomId, difficulty } = data;
  const question = await getQuestionByDifficulty(difficulty);
  await setQuestionRedis(roomId, question, pub);

  const redisPubSubAdapter = createRedisPubSubAdapter(pub, sub, username, roomId);

  const writeFunc = (response: string) => subscriptionListener(call, response, username);
  await redisPubSubAdapter.registerEvent(writeFunc);

  // When data is detected
  call.on('data', (request: CollabTunnelRequest) => {
    const messageJson = createPushStruct(username, request);
    redisPubSubAdapter.push(messageJson);
  });

  // When stream closes
  call.on('end', () => {
    const endFunc = () => call.end();
    redisPubSubAdapter.clean(endFunc);
  });
}

class CollabTunnelPubSub {
  public serviceDefinition: ServiceDefinition<ICollabTunnelService>;

  public serviceImplementation: ICollabTunnelService;

  constructor() {
    const collabService: ICollabTunnelService = {
      openStream: pubSubOpenStream,
    };

    this.serviceDefinition = collabTunnelServiceDefinition;
    this.serviceImplementation = collabService;
  }
}

export default CollabTunnelPubSub;
