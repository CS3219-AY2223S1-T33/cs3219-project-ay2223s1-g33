import { Request, Response } from 'express';
import { createClient, RedisClientType } from 'redis';

import getApiServer from './api_server/api_server';
import loadEnvironment from './utils/env_loader';
import MatchingServiceApi from './controller/matching_service_controller';
import { createRedisMatchingAdapter } from './redis_adapter/redis_matching_adapter';
import { IRoomSessionAgent } from './room_auth/room_session_agent_types';
import createRoomSessionService from './room_auth/room_session_agent';

const envConfig = loadEnvironment();

const redisClient: RedisClientType = createClient({
  url: envConfig.REDIS_SERVER_URL,
});
redisClient.connect();

const redisMatchingAdapter = createRedisMatchingAdapter(redisClient);

const apiServer = getApiServer(envConfig.HTTP_PORT, envConfig.GRPC_PORT);
const expressApp = apiServer.getHttpServer();

const roomAuthService: IRoomSessionAgent = createRoomSessionService(
  envConfig.JWT_ROOM_SECRET,
);

expressApp.get('/', (_: Request, resp: Response) => {
  resp.status(200).send('Welcome to Matching Service');
});

apiServer.registerServiceRoutes(
  new MatchingServiceApi(roomAuthService, redisMatchingAdapter),
);
apiServer.bind();
