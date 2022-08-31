import { Request, Response } from 'express';

import ApiServer from './api_server/api_server';

const httpPort: number = 8081;
const grpcPort: number = 4000;

const apiServer = new ApiServer(httpPort, grpcPort);
const expressApp = apiServer.getHttpServer();

expressApp.get('/', (_: Request, resp: Response) => {
  resp.status(200).send('Welcome to User Service');
});

apiServer.bind();
