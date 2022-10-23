import { handleUnaryCall } from '@grpc/grpc-js';
import { IProtocolServer } from './api_server_types';

declare type GRPCRouteHandler<T, V> = handleUnaryCall<T, V>;

declare interface IGRPCServer extends IProtocolServer {
}

export {
  GRPCRouteHandler,
  IGRPCServer,
};
