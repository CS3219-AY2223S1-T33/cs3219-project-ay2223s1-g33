import { IMessageType } from '@protobuf-ts/runtime';

declare interface ILoopbackServiceChannel<T = UntypedServiceImplementation> {
  registerServiceRoutes(apiService: ApiService<T>): void;
  callRoute<R extends object, U extends object>(
    route: string,
    request: R,
    responseContainer: IMessageType<U>,
  ): Promise<U>
}

declare type LoopbackRouteHandler = (req: object) => Promise<object>;

export {
  ILoopbackServiceChannel,
  LoopbackRouteHandler,
};
