import { Request, Response } from 'express';

import getApiServer from './api_server/api_server';
import loadEnvironment from './utils/env_loader';
import AppStorage from './storage/app_storage';
import QuestionServiceApi from './controller/question_service_controller';
import Constants from './constants';
import Logger from './utils/logger';
import { connectDatabase } from './db';

function printVersion() {
  const version = `${Constants.VERSION_MAJOR}.${Constants.VERSION_MINOR}.${Constants.VERSION_REVISION}`;
  Logger.info(`Starting Question Service [V${version}]`);
}

async function run() {
  printVersion();
  const envConfig = loadEnvironment();

  const dbConnection = await connectDatabase(envConfig);
  const dataStore: AppStorage = new AppStorage(dbConnection);

  const apiServer = getApiServer(envConfig.HTTP_PORT, envConfig.GRPC_PORT);
  const expressApp = apiServer.getHttpServer();

  expressApp.get('/', (_: Request, resp: Response) => {
    resp.status(200).send('Welcome to Question Service');
  });

  apiServer.registerServiceRoutes(new QuestionServiceApi(dataStore));
  apiServer.bind();
}

run();
