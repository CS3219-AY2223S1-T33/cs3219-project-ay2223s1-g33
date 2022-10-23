import {
  handleUnaryCall,
} from '@grpc/grpc-js';

declare interface ILoopbackServiceChannel<T = UntypedServiceImplementation> {
  client: LoopbackServiceClient<T>;
}

declare type LoopbackRouteHandler<S extends handleUnaryCall<any, any>> =
  S extends handleUnaryCall<infer R, infer U> ? (req: R) => Promise<U> : undefined;

declare type LoopbackServiceClient<T = UntypedServiceImplementation> = {
  readonly [index in keyof T]: LoopbackRouteHandler<T[index]>;
};

export {
  ILoopbackServiceChannel,
  LoopbackRouteHandler,
  LoopbackServiceClient,
};
