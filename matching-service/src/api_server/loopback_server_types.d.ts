import {
  handleUnaryCall,
  UntypedServiceImplementation,
} from '@grpc/grpc-js';

declare interface ILoopbackServiceChannel<T = UntypedServiceImplementation> {
  client: LoopbackServiceClient<T>;
}

declare type LoopbackRouteHandler<S extends handleUnaryCall<any, any>> =
  S extends handleUnaryCall<infer R, infer U> ? (req: R) => Promise<U> : undefined;

declare type LoopbackServiceClient<T = UntypedServiceImplementation> = {
  readonly [index in keyof T]: (T[index] extends handleUnaryCall<any, any> ?
    LoopbackRouteHandler<T[index]> : undefined);
};

export {
  ILoopbackServiceChannel,
  LoopbackRouteHandler,
  LoopbackServiceClient,
};
