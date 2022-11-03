import { Request, Response } from 'express';

import { createClient, RedisClientType } from 'redis';
import createApiServer from './api_server/api_server';
import loadEnvironment from './utils/env_loader';
import AppStorage from './storage/app_storage';
import HistoryCrudServiceApi from './controller/history_crud_service_controller';
import HistoryServiceApi from './controller/history_service_controller';
import LoopbackApiChannel from './api_server/loopback_channel';
import { IHistoryCrudService } from './proto/history-crud-service.grpc-server';
import Constants from './constants';
import Logger from './utils/logger';
import { connectDatabase } from './db';
import createHistoryRedisConsumer from './redis_stream_adapter/history_redis_consumer';
import HTTPServer from './api_server/http_server';
import GRPCServer from './api_server/grpc_server';

function printVersion() {
  const version = `${Constants.VERSION_MAJOR}.${Constants.VERSION_MINOR}.${Constants.VERSION_REVISION}`;
  Logger.info(`Starting History Service [V${version}]`);
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
  const consumer = createHistoryRedisConsumer(redis, dataStore.getAttemptStore());
  consumer.setListeners();
  consumer.run();

  const httpServer = HTTPServer.create(envConfig.HTTP_PORT);
  const grpcServer = GRPCServer.create(
    envConfig.GRPC_PORT,
    envConfig.GRPC_CERT,
    envConfig.GRPC_KEY,
  );
  const apiServer = createApiServer(httpServer, grpcServer);
  const expressApp = httpServer.getServer();

  // @ts-ignore
  expressApp.get('/', (_: Request, resp: Response) => {
    // @ts-ignore
    resp.status(200).send('Welcome to History Service');
  });

  const crudController = new HistoryCrudServiceApi(
    dataStore,
    envConfig.USER_SERVICE_URL,
    envConfig.QUESTION_SERVICE_URL,
    envConfig.GRPC_CERT,
  );
  apiServer.registerServiceRoutes(crudController);

  const loopbackCrudController = new LoopbackApiChannel<IHistoryCrudService>(crudController);
  const historyServiceController = new HistoryServiceApi(loopbackCrudController);
  apiServer.registerServiceRoutes(historyServiceController);

  apiServer.bind();
}

run();
