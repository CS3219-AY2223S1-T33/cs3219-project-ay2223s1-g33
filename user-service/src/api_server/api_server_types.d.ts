import {
  Server as GrpcServer,
  UntypedServiceImplementation,
  ServiceDefinition,
  handleUnaryCall,
} from '@grpc/grpc-js';
import { IMessageType } from '@protobuf-ts/runtime';
import { Express } from 'express';

declare type ApiHeaderMap = { [key: string]: string[] };

declare type ApiRequest<RequestType> = {
  request: RequestType;
  headers: ApiHeaderMap;
};

declare type ApiResponse<ResponseType> = {
  response: ResponseType;
  headers: ApiHeaderMap;
};

declare type HTTPResponse = {
  jsonResponse: any;
  headers: ApiHeaderMap;
};

declare interface IApiHandler<RequestType, ResponseType> {
  handle(request: ApiRequest<RequestType>): Promise<ApiResponse<ResponseType>>;
}

declare type GRPCRouteHandler<T, V> = handleUnaryCall<T, V>;
declare type HTTPRouteHandler = (json: any, headers: ApiHeaderMap) => Promise<HTTPResponse>;
declare type LoopbackRouteHandler = (req: object) => Promise<object>;

declare type ApiCallHandler<RequestType, ResponseType> = {
  handler: IApiHandler<RequestType, ResponseType>;
  grpcRouteHandler: GRPCRouteHandler<RequestType, ResponseType>;
  httpRouteHandler: HTTPRouteHandler;
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

declare interface IApiServer {
  getHttpServer(): Express;
  getGrpcServer(): GrpcServer;
  bind(): void;
  registerServiceRoutes<T extends UntypedServiceImplementation>(apiService: ApiService<T>): void;
}

declare interface ILoopbackServiceChannel<T = UntypedServiceImplementation> {
  registerServiceRoutes(apiService: ApiService<T>): void;
  callRoute<R extends object, U extends object>(
    route: string,
    request: R,
    responseContainer: IMessageType<U>,
  ): Promise<U>
}

export {
  IApiServer,
  IApiHandler,
  ApiCallHandler,
  ServiceHandlerDefinition,
  ApiService,
  ApiRequest,
  ApiResponse,
  HTTPResponse,
  HTTPRouteHandler,
  GRPCRouteHandler,
  LoopbackRouteHandler,
  ILoopbackServiceChannel,
  ApiHeaderMap,
};
