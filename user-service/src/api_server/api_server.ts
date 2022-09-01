import cors from 'cors';
import express, { Express, Request, Response } from 'express';
import { Server as GrpcServer, ServerCredentials, UntypedServiceImplementation } from '@grpc/grpc-js';
import { ApiService, IApiServer } from './api_server_types';
import jsonParseMiddleware from '../utils/json_middleware';
import Logger from '../utils/logger';

const hostAddress = '0.0.0.0';

class ApiServer implements IApiServer {
  httpPort: number;

  grpcPort: number;

  httpServer: Express;

  grpcServer: GrpcServer;

  constructor(httpPort: number, grpcPort: number) {
    this.httpPort = httpPort;
    this.grpcPort = grpcPort;
    this.httpServer = express();
    this.httpServer.use(cors());

    this.grpcServer = new GrpcServer();
  }

  getHttpServer(): Express {
    return this.httpServer;
  }

  getGrpcServer(): GrpcServer {
    return this.grpcServer;
  }

  bindHttpServer(): void {
    this.httpServer.listen(this.httpPort, hostAddress, () => {
      Logger.info(`API server is running at http://${hostAddress}:${this.httpPort}`);
    });
  }

  bindGrpcServer(): void {
    this.grpcServer.bindAsync(
      `${hostAddress}:${this.grpcPort}`,
      ServerCredentials.createInsecure(),
      (err: Error | null, port: number) => {
        if (err) {
          Logger.error(`GRPC Server error: ${err.message}`);
        } else {
          Logger.info(`GRPC Server bound on port: ${port}`);
          this.grpcServer.start();
        }
      },
    );
  }

  bind(): void {
    this.bindHttpServer();
    this.bindGrpcServer();
  }

  registerServiceRoutes<T extends UntypedServiceImplementation>(apiService: ApiService<T>): void {
    this.grpcServer.addService(apiService.serviceDefinition, apiService.serviceImplementation);

    const httpRouter = express.Router();
    Object.keys(apiService.serviceHandlerDefinition).forEach((key) => {
      httpRouter.post(`/${key}`, jsonParseMiddleware, async (req: Request, resp: Response) => {
        try {
          const response = await apiService.serviceHandlerDefinition[key]
            .httpRouteHandler(req.body);
          resp.json(response);
        } catch {
          resp.status(400).json({});
        }
      });
    });
    this.httpServer.use('/grpc', httpRouter);
  }
}

function createApiServer(httpPort: number, grpcPort: number): IApiServer {
  return new ApiServer(httpPort, grpcPort);
}

export default createApiServer;
