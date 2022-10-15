import { Request, Response } from 'express';

import { createClient, RedisClientType } from 'redis';
import getApiServer from './api_server/api_server';
import loadEnvironment from './utils/env_loader';
import AppStorage from './storage/app_storage';
import HistoryCrudServiceApi from './controller/history_crud_service_controller';
import HistoryServiceApi from './controller/history_service_controller';
import LoopbackApiChannel from './api_server/loopback_channel';
import { IHistoryCrudService } from './proto/history-crud-service.grpc-server';
import Constants from './constants';
import Logger from './utils/logger';
import { connectDatabase } from './db';
import runRedisStreamConsumer from './redis_stream_adapter/consumer';

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
  });
  await redis.connect();
  runRedisStreamConsumer(redis, dataStore);

  const apiServer = getApiServer(envConfig.HTTP_PORT, envConfig.GRPC_PORT);
  const expressApp = apiServer.getHttpServer();

  // @ts-ignore
  expressApp.get('/', (_: Request, resp: Response) => {
    // @ts-ignore
    resp.status(200).send('Welcome to History Service');
  });

  const crudController = new HistoryCrudServiceApi(
    dataStore,
    envConfig.USER_SERVICE_URL,
    envConfig.QUESTION_SERVICE_URL,
  );
  apiServer.registerServiceRoutes(crudController);

  const loopbackCrudController = new LoopbackApiChannel<IHistoryCrudService>();
  loopbackCrudController.registerServiceRoutes(crudController);
  const historyServiceController = new HistoryServiceApi(loopbackCrudController);
  apiServer.registerServiceRoutes(historyServiceController);

  apiServer.bind();
}

run();
