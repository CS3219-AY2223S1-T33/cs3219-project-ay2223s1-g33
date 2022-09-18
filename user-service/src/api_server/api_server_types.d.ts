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

declare type ApiCallHandler<RequestType, ResponseType> = {
  handler: IApiHandler<RequestType, ResponseType>;
  grpcRouteHandler: handleUnaryCall<RequestType, ResponseType>;
  httpRouteHandler: (json: any, headers: { [key: string]: string[] }) => Promise<HTTPResponse>;
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
  ApiRequest,
  ApiResponse,
  HTTPResponse,
};
