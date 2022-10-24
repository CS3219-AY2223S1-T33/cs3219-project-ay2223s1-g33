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
import {
  ApiHeaderMap,
  ApiResponse,
  ApiService,
  IApiHandler,
} from './api_server_types';
import { IGRPCServer } from './grpc_server_types';

const HOST_ADDRESS = '0.0.0.0';

export default class GRPCServer implements IGRPCServer {
  grpcPort: number;

  grpcServer: BaseServer;

  private constructor(grpcPort: number) {
    this.grpcPort = grpcPort;
    this.grpcServer = new BaseServer();
  }

  registerServiceRoutes<T extends UntypedServiceImplementation>(apiService: ApiService<T>): void {
    const service: { [k: string]: handleUnaryCall<any, any> } = {};
    Object.keys(apiService.serviceHandlerDefinition).forEach((key) => {
      service[key] = GRPCServer.adaptToGRPCHandler(apiService
        .serviceHandlerDefinition[key].handler);
    });

    this.grpcServer.addService(apiService.serviceDefinition, service as T);
  }

  bind() {
    const errorCallback = (err: Error | null, port: number) => {
      if (err) {
        Logger.error(`GRPC Server error: ${err.message}`);
      } else {
        Logger.info(`GRPC Server bound on port: ${port}`);
        this.grpcServer.start();
      }
    };

    this.grpcServer.bindAsync(
      `${HOST_ADDRESS}:${this.grpcPort}`,
      ServerCredentials.createInsecure(),
      errorCallback,
    );
  }

  static adaptToGRPCHandler<RequestType, ResponseType>(
    handler: IApiHandler<RequestType, ResponseType>,
  ): handleUnaryCall<RequestType, ResponseType> {
    return async (
      call: ServerUnaryCall<RequestType, ResponseType>,
      callback: sendUnaryData<ResponseType>,
    ) => {
      call.on('error', (args) => {
        Logger.warn(`Error on GRPC Route call: ${args}`);
      });

      const headers = GRPCServer.parseIncomingMetadata(call.metadata);
      const response: ApiResponse<ResponseType> = await handler.handle({
        request: call.request,
        headers,
      });

      const responseHeaders = GRPCServer.buildOutgoingMetadata(response.headers);
      call.sendMetadata(responseHeaders);
      callback(null, response.response, undefined);
    };
  }

  getServer(): BaseServer {
    return this.grpcServer;
  }

  static parseIncomingMetadata(metadata: Metadata): ApiHeaderMap {
    const metadataMap = metadata.getMap();
    const headers: ApiHeaderMap = {};
    Object.keys(metadataMap).forEach((key: string) => {
      const value = metadata.get(key);
      if (value.length === 0) {
        return;
      }
      headers[key] = value.map((x) => x.toString());
    });

    return headers;
  }

  static buildOutgoingMetadata(headers: ApiHeaderMap): Metadata {
    const responseHeaders = new Metadata();
    Object.keys(headers).forEach((key: string) => {
      const values = headers[key];
      if (values.length === 0) {
        return;
      }

      if (key.toLowerCase() === 'set-cookie') {
        values.forEach((value) => responseHeaders.add(key, value));
      } else {
        responseHeaders.add(key, headers[key][0]);
      }
    });

    return responseHeaders;
  }

  static create(grpcPort: number): IGRPCServer {
    return new GRPCServer(grpcPort);
  }
}
