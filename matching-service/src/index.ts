import { Request, Response } from 'express';

import getApiServer from './api_server/api_server';
import loadEnvironment from './utils/env_loader';
import { IAuthenticationAgent } from './auth/authentication_agent_types';
import createAuthenticationService from './auth/authentication_agent';
import MatchingServiceApi from './controller/matching_service_controller';
import { createRedisAdapter } from './redis/redis_adapter';
import { IRoomSessionAgent } from './room_auth/room_session_agent_types';
import createRoomSessionService from './room_auth/room_session_agent';

const envConfig = loadEnvironment();

const apiServer = getApiServer(envConfig.HTTP_PORT, envConfig.GRPC_PORT);
const expressApp = apiServer.getHttpServer();

const userAuthService: IAuthenticationAgent = createAuthenticationService(
  envConfig.JWT_SIGNING_SECRET,
);
const redisAdapter = createRedisAdapter(envConfig.REDIS_SERVER_URL);
redisAdapter.connect();

const roomAuthService: IRoomSessionAgent = createRoomSessionService(
  envConfig.JWT_SIGNING_SECRET,
);

expressApp.get('/', (_: Request, resp: Response) => {
  resp.status(200).send('Welcome to Matching Service');
});

apiServer.registerServiceRoutes(
  new MatchingServiceApi(userAuthService, roomAuthService, redisAdapter),
);
apiServer.bind();
