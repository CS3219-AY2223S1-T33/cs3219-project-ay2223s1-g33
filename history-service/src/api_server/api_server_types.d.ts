import {
  Server as GrpcServer,
  UntypedServiceImplementation,
  ServiceDefinition,
  handleUnaryCall,
} from '@grpc/grpc-js';
import { IMessageType } from '@protobuf-ts/runtime';
import { Express } from 'express';

declare interface IApiServer {
  getHttpServer(): Express;
  getGrpcServer(): GrpcServer;
  bind(): void;
  registerServiceRoutes<T extends UntypedServiceImplementation>(apiService: ApiService<T>): void;
}

declare type ApiRequest<RequestType> = {
  request: RequestType;
  headers: { [key: string]: string[] };
};

declare type ApiResponse<ResponseType> = {
  response: ResponseType;
  headers: { [key: string]: string[] };
};

declare type HTTPResponse = {
  jsonResponse: any;
  headers: { [key: string]: string[] };
};

declare interface IApiHandler<RequestType, ResponseType> {
  handle(request: ApiRequest<RequestType>): Promise<ApiResponse<ResponseType>>;
}

declare type LoopbackRouteHandler = (req: object) => Promise<object>;

declare type ApiCallHandler<RequestType, ResponseType> = {
  handler: IApiHandler<RequestType, ResponseType>;
  grpcRouteHandler: handleUnaryCall<RequestType, ResponseType>;
  httpRouteHandler: (json: any, headers: { [key: string]: string[] }) => Promise<HTTPResponse>;
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

declare interface ILoopbackServiceChannel<T extends UntypedServiceImplementation> {
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
  LoopbackRouteHandler,
  ILoopbackServiceChannel,
};
