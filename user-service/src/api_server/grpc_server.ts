import {
  handleUnaryCall,
  Metadata,
  sendUnaryData,
  Server as BaseServer,
  ServerCredentials,
  ServerUnaryCall,
  UntypedServiceImplementation,
} from '@grpc/grpc-js';
import Logger from '../utils/logger';
import { ApiResponse, ApiService, IApiHandler } from './api_server_types';
import { IGRPCServer } from './grpc_server_types';

const HOST_ADDRESS = '0.0.0.0';

class GRPCServer implements IGRPCServer {
  grpcPort: number;

  grpcServer: BaseServer;

  constructor(grpcPort: number) {
    this.grpcPort = grpcPort;
    this.grpcServer = new BaseServer();
  }

  registerServiceRoutes<T extends UntypedServiceImplementation>(apiService: ApiService<T>): void {
    const service: { [k: string]: handleUnaryCall<any, any> } = {};
    Object.keys(apiService.serviceHandlerDefinition).forEach((key) => {
      service[key] = GRPCServer.getGrpcRouteHandler(apiService
        .serviceHandlerDefinition[key].handler);
    });

    this.grpcServer.addService(apiService.serviceDefinition, service as T);
  }

  bind() {
    this.grpcServer.bindAsync(
      `${HOST_ADDRESS}:${this.grpcPort}`,
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

  static getGrpcRouteHandler<RequestType, ResponseType>(
    handler: IApiHandler<RequestType, ResponseType>,
  ): handleUnaryCall<RequestType, ResponseType> {
    return async (
      call: ServerUnaryCall<RequestType, ResponseType>,
      callback: sendUnaryData<ResponseType>,
    ) => {
      call.on('error', (args) => {
        Logger.warn(`Error on GRPC Route call: ${args}`);
      });

      const metadata = call.metadata.getMap();
      const headers: { [key: string]: string[] } = {};
      Object.keys(metadata).forEach((key: string) => {
        headers[key] = [metadata[key].toString()];
      });

      const cookies = call.metadata.get('Cookie').map((val) => val.toString());
      if (cookies.length > 0) {
        headers.Cookie = cookies;
      }

      const response: ApiResponse<ResponseType> = await handler.handle({
        request: call.request,
        headers,
      });

      const responseHeaders = new Metadata();
      Object.keys(response.headers).forEach((key: string) => {
        const values = response.headers[key];
        if (values.length === 0) {
          return;
        }

        if (key === 'Set-Cookie') {
          values.forEach((value) => responseHeaders.add(key, value));
        } else {
          responseHeaders.add(key, response.headers[key][0]);
        }
      });

      call.sendMetadata(responseHeaders);
      callback(null, response.response, undefined);
    };
  }
}

export default function makeGRPCServer(grpcPort: number): IGRPCServer {
  return new GRPCServer(grpcPort);
}
