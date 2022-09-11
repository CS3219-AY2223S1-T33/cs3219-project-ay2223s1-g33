import { Request, Response } from 'express';
import { RedisClientType, createClient } from 'redis';

import getApiServer from './api_server/api_server';
import createAuthenticationService from './auth/authentication_agent';
import { IAuthenticationAgent } from './auth/authentication_agent_types';
import CollabServiceApi from './controller/collab_service_controller';
import loadEnvironment from './utils/env_loader';
import { createRedisAuthAdapter } from './redis_adapter/redis_auth_adapter';

const envConfig = loadEnvironment();

const redisConnection: RedisClientType = createClient({
  url: envConfig.REDIS_SERVER_URL,
});
redisConnection.connect();
const redisAuthAdapter = createRedisAuthAdapter(redisConnection);

const authService: IAuthenticationAgent = createAuthenticationService(
  envConfig.JWT_SIGNING_SECRET,
  redisAuthAdapter,
);

const apiServer = getApiServer(envConfig.HTTP_PORT, envConfig.GRPC_PORT);
const expressApp = apiServer.getHttpServer();

expressApp.get('/', (_: Request, resp: Response) => {
  resp.status(200)
    .send('Welcome to Collaboration Service');
});

apiServer.registerServiceRoutes(new CollabServiceApi(envConfig.JWT_ROOM_SECRET, authService));
apiServer.bind();
