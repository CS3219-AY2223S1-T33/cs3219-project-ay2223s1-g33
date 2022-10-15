import { Request, Response } from 'express';

import { createClient, RedisClientType } from 'redis';
import getApiServer from './api_server/api_server';
import createAuthenticationService from './auth/authentication_agent';
import { IAuthenticationAgent } from './auth/authentication_agent_types';
import UserServiceApi from './controller/user_service_controller';
import UserCrudServiceApi from './controller/user_crud_service_controller';
import AppStorage from './storage/app_storage';
import loadEnvironment from './utils/env_loader';
import Constants from './constants';
import Logger from './utils/logger';
import LoopbackApiChannel from './api_server/loopback_channel';
import { IUserCrudService } from './proto/user-crud-service.grpc-server';
import { connectDatabase } from './db';
import createSMTPAdapter from './adapter/smtp_adapter';
import { createEmailSender } from './email/email_sender';
import createUserDeleteProducer from './redis_stream_adapter/user_delete_producer';

function printVersion() {
  const version = `${Constants.VERSION_MAJOR}.${Constants.VERSION_MINOR}.${Constants.VERSION_REVISION}`;
  Logger.info(`Starting User Service [V${version}]`);
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
  const redisUserStream = createUserDeleteProducer(redis);

  const authService: IAuthenticationAgent = createAuthenticationService(
    envConfig.SESSION_SERVICE_URL,
  );

  const emailAdapter = createSMTPAdapter({
    service: envConfig.EMAIL_SERVICE,
    server: envConfig.EMAIL_SERVER,
    port: envConfig.EMAIL_PORT,
    isSecure: envConfig.EMAIL_IS_SECURE,
  }, {
    username: envConfig.EMAIL_USERNAME,
    password: envConfig.EMAIL_PASSWORD,
  });
  const emailSender = createEmailSender(emailAdapter, envConfig.RESET_PASSWORD_URL);

  const apiServer = getApiServer(envConfig.HTTP_PORT, envConfig.GRPC_PORT);
  const expressApp = apiServer.getHttpServer();

  expressApp.get('/', (_: Request, resp: Response) => {
    resp.status(200).send('Welcome to User Service');
  });

  const userCrudApi = new UserCrudServiceApi(dataStore, redisUserStream);
  apiServer.registerServiceRoutes(userCrudApi);

  const loopbackCrudApi = new LoopbackApiChannel<IUserCrudService>();
  loopbackCrudApi.registerServiceRoutes(userCrudApi);
  apiServer.registerServiceRoutes(new UserServiceApi(
    authService,
    emailSender,
    loopbackCrudApi,
  ));
  apiServer.bind();
}

run();
