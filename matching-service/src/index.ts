import { Request, Response } from 'express';
import { createClient, RedisClientType } from 'redis';

import createApiServer from './api_server/api_server';
import loadEnvironment from './utils/env_loader';
import MatchingServiceApi from './controller/matching_service_controller';
import { createRedisMatchingAdapter } from './redis_adapter/redis_matching_adapter';
import { IRoomSessionAgent } from './room_auth/room_session_agent_types';
import createRoomSessionService from './room_auth/room_session_agent';
import Logger from './utils/logger';
import Constants from './constants';
import HTTPServer from './api_server/http_server';
import GRPCServer from './api_server/grpc_server';

const version = `${Constants.VERSION_MAJOR}.${Constants.VERSION_MINOR}.${Constants.VERSION_REVISION}`;
Logger.info(`Starting Matching Service [V${version}]`);

const envConfig = loadEnvironment();

const redisClient: RedisClientType = createClient({
  url: envConfig.REDIS_SERVER_URL,
});
redisClient.connect();

const redisMatchingAdapter = createRedisMatchingAdapter(redisClient);
const httpServer = HTTPServer.create(envConfig.HTTP_PORT);
const grpcServer = GRPCServer.create(envConfig.GRPC_PORT);
const apiServer = createApiServer(httpServer, grpcServer);
const expressApp = httpServer.getServer();

const roomAuthService: IRoomSessionAgent = createRoomSessionService(
  envConfig.ROOM_SIGNING_SECRET,
);

expressApp.get('/', (_: Request, resp: Response) => {
  resp.status(200).send('Welcome to Matching Service');
});

apiServer.registerServiceRoutes(
  new MatchingServiceApi(roomAuthService, redisMatchingAdapter),
);
apiServer.bind();
