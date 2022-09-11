import { Request, Response } from 'express';
import { createClient, RedisClientType } from 'redis';

import getApiServer from './api_server/api_server';
import loadEnvironment from './utils/env_loader';
import { IAuthenticationAgent } from './auth/authentication_agent_types';
import createAuthenticationService from './auth/authentication_agent';
import MatchingServiceApi from './controller/matching_service_controller';
import { createRedisMatchingAdapter } from './redis_adapter/redis_matching_adapter';
import { createRedisAuthAdapter } from './redis_adapter/redis_auth_adapter';

const envConfig = loadEnvironment();

const redisClient: RedisClientType = createClient({
  url: envConfig.REDIS_SERVER_URL,
});
redisClient.connect();

const redisMatchingAdapter = createRedisMatchingAdapter(redisClient);
const redisAuthAdapter = createRedisAuthAdapter(redisClient);

const authService: IAuthenticationAgent = createAuthenticationService(
  envConfig.JWT_SIGNING_SECRET,
  redisAuthAdapter,
);

const apiServer = getApiServer(envConfig.HTTP_PORT, envConfig.GRPC_PORT);
const expressApp = apiServer.getHttpServer();

expressApp.get('/', (_: Request, resp: Response) => {
  resp.status(200).send('Welcome to Matching Service');
});

apiServer.registerServiceRoutes(new MatchingServiceApi(authService, redisMatchingAdapter));
apiServer.bind();
