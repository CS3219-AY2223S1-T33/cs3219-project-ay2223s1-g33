import { handleUnaryCall, Server as BaseServer } from '@grpc/grpc-js';
import { IProtocolServer } from './api_server_types';

declare type GRPCRouteHandler<T, V> = handleUnaryCall<T, V>;

declare interface IGRPCServer extends IProtocolServer {
  getServer(): BaseServer
}

export {
  GRPCRouteHandler,
  IGRPCServer,
};
