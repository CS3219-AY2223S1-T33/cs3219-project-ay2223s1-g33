import { UntypedServiceImplementation, ServiceDefinition, handleUnaryCall } from '@grpc/grpc-js';

declare interface IApiHandler<RequestType, ResponseType> {
  handle(request: RequestType): Promise<ResponseType>;
}

declare type ApiCallHandler<RequestType, ResponseType> = {
  handler: IApiHandler<RequestType, ResponseType>,
  grpcRouteHandler: handleUnaryCall<RequestType, ResponseType>
  httpRouteHandler: (json: any) => Promise<any>,
};

declare type ServiceHandlerDefinition<ServiceDefinition = UntypedServiceImplementation> = {
  readonly [index in keyof ServiceDefinition]: ApiCallHandler<any, any>
};

declare interface ApiService<T extends UntypedServiceImplementation> {
  readonly serviceHandlerDefinition: ServiceHandlerDefinition<T>,
  readonly serviceDefinition: ServiceDefinition<T>,
  readonly serviceImplementation: T,
}

export {
  IApiHandler,
  ApiCallHandler,
  ServiceHandlerDefinition,
  ApiService,
};
