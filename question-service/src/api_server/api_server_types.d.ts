import {
  UntypedServiceImplementation,
  ServiceDefinition,
} from '@grpc/grpc-js';
import { IMessageType } from '@protobuf-ts/runtime';

declare type ApiHeaderMap = { [key: string]: string[] };

declare type ApiRequest<RequestType> = {
  request: RequestType;
  headers: ApiHeaderMap;
};

declare type ApiResponse<ResponseType> = {
  response: ResponseType;
  headers: ApiHeaderMap;
};

declare interface IApiHandler<RequestType, ResponseType> {
  handle(request: ApiRequest<RequestType>): Promise<ApiResponse<ResponseType>>;
}

declare type TypedApiHandler<RequestType extends object, ResponseType extends object> = {
  handler: IApiHandler<RequestType, ResponseType>;
  reqType: IMessageType<RequestType>;
  respType: IMessageType<ResponseType>;
};

declare type ServiceHandlerDefinition<ServiceDefinition = UntypedServiceImplementation> = {
  readonly [index in keyof ServiceDefinition]: TypedApiHandler<any, any>;
};

declare interface ApiService<T extends UntypedServiceImplementation> {
  readonly serviceHandlerDefinition: ServiceHandlerDefinition<T>;
  readonly serviceDefinition: ServiceDefinition<T>;
}

declare interface IProtocolServer {
  registerServiceRoutes<T extends UntypedServiceImplementation>(apiService: ApiService<T>): void;
  bind(): void;
}

declare interface IApiServer {
  bind(): void;
  registerServiceRoutes<T extends UntypedServiceImplementation>(apiService: ApiService<T>): void;
}

export {
  IApiServer,
  IApiHandler,
  ServiceHandlerDefinition,
  ApiService,
  ApiRequest,
  ApiResponse,
  ApiHeaderMap,
  IProtocolServer,
  TypedApiHandler,
};
