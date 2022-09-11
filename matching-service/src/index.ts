import { Request, Response } from 'express';

import getApiServer from './api_server/api_server';
import loadEnvironment from './utils/env_loader';
import { IAuthenticationAgent } from './auth/authentication_agent_types';
import createAuthenticationService from './auth/authentication_agent';
import MatchingServiceApi from './controller/matching_service_controller';
import { createRedisAdapter } from './redis/redis_adapter';

const envConfig = loadEnvironment();

const apiServer = getApiServer(envConfig.HTTP_PORT, envConfig.GRPC_PORT);
const expressApp = apiServer.getHttpServer();

const authService: IAuthenticationAgent = createAuthenticationService(
  envConfig.JWT_SIGNING_SECRET,
);
const redisAdapter = createRedisAdapter(envConfig.REDIS_SERVER_URL);
redisAdapter.connect();

expressApp.get('/', (_: Request, resp: Response) => {
  resp.status(200).send('Welcome to Matching Service');
});

apiServer.registerServiceRoutes(new MatchingServiceApi(envConfig.JWT_ROOM_SECRET, authService, redisAdapter));
apiServer.bind();
