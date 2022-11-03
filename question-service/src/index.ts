import { Request, Response } from 'express';

import { createClient, RedisClientType } from 'redis';
import createApiServer from './api_server/api_server';
import loadEnvironment from './utils/env_loader';
import AppStorage from './storage/app_storage';
import QuestionServiceApi from './controller/question_service_controller';
import Constants from './constants';
import Logger from './utils/logger';
import { connectDatabase } from './db';
import createQuestionDeleteProducer from './redis_stream_adapter/question_delete_producer';
import HTTPServer from './api_server/http_server';
import GRPCServer from './api_server/grpc_server';

function printVersion() {
  const version = `${Constants.VERSION_MAJOR}.${Constants.VERSION_MINOR}.${Constants.VERSION_REVISION}`;
  Logger.info(`Starting Question Service [V${version}]`);
}

async function run() {
  printVersion();
  const envConfig = loadEnvironment();

  const dbConnection = await connectDatabase(envConfig);
  const dataStore: AppStorage = new AppStorage(dbConnection);

  const redis: RedisClientType = createClient({
    url: envConfig.REDIS_SERVER_URL,
    password: envConfig.REDIS_PASSWORD.length > 0 ? envConfig.REDIS_PASSWORD : undefined,
  });
  await redis.connect();
  const redisQuestionStream = createQuestionDeleteProducer(redis);

  const httpServer = HTTPServer.create(envConfig.HTTP_PORT);
  const grpcServer = GRPCServer.create(
    envConfig.GRPC_PORT,
    envConfig.GRPC_CERT,
    envConfig.GRPC_KEY,
  );

  const apiServer = createApiServer(httpServer, grpcServer);
  const expressApp = httpServer.getServer();

  expressApp.get('/', (_: Request, resp: Response) => {
    resp.status(200).send('Welcome to Question Service');
  });

  apiServer.registerServiceRoutes(new QuestionServiceApi(dataStore, redisQuestionStream));
  apiServer.bind();
}

run();
