import { Request, Response } from 'express';

import getApiServer from './api_server/api_server';
import loadEnvironment from './utils/env_loader';
import AppStorage from './storage/app_storage';
import HistoryCrudServiceApi from './controller/history_crud_service_controller';

const envConfig = loadEnvironment();

const dataStore: AppStorage = new AppStorage();

const apiServer = getApiServer(envConfig.HTTP_PORT, envConfig.GRPC_PORT);
const expressApp = apiServer.getHttpServer();

expressApp.get('/', (_: Request, resp: Response) => {
  resp.status(200).send('Welcome to Question Service');
});

apiServer.registerServiceRoutes(new HistoryCrudServiceApi(dataStore, envConfig.USER_SERVICE_URL));
apiServer.bind();
