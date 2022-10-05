import {
  Server as GrpcServer,
  UntypedServiceImplementation,
  ServiceDefinition,
  handleUnaryCall,
} from '@grpc/grpc-js';
import { Express } from 'express';

declare interface IApiServer {
  getHttpServer(): Express;
  getGrpcServer(): GrpcServer;
  bind(): void;
  registerServiceRoutes<T extends UntypedServiceImplementation>(apiService: ApiService<T>): void;
}

declare interface IApiHandler<RequestType, ResponseType> {
  handle(request: RequestType): Promise<ResponseType>;
}

declare type LoopbackRouteHandler = (object) => Promise<object>;

declare type ApiCallHandler<RequestType, ResponseType> = {
  handler: IApiHandler<RequestType, ResponseType>;
  grpcRouteHandler: handleUnaryCall<RequestType, ResponseType>;
  httpRouteHandler: (json: any) => Promise<any>;
  loopbackRouteHandler: LoopbackRouteHandler;
};

declare type ServiceHandlerDefinition<ServiceDefinition = UntypedServiceImplementation> = {
  readonly [index in keyof ServiceDefinition]: ApiCallHandler<any, any>;
};

declare interface ApiService<T extends UntypedServiceImplementation> {
  readonly serviceHandlerDefinition: ServiceHandlerDefinition<T>;
  readonly serviceDefinition: ServiceDefinition<T>;
  readonly serviceImplementation: T;
}

export {
  IApiServer,
  IApiHandler,
  ApiCallHandler,
  ServiceHandlerDefinition,
  ApiService,
  LoopbackRouteHandler,
};
