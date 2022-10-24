import { handleUnaryCall, UntypedServiceImplementation } from '@grpc/grpc-js';
import { IMessageType } from '@protobuf-ts/runtime';
import { ApiService, IApiHandler } from './api_server_types';
import { LoopbackRouteHandler, ILoopbackServiceChannel, LoopbackServiceClient } from './loopback_server_types';

export default class LoopbackApiChannel<S extends UntypedServiceImplementation>
implements ILoopbackServiceChannel<S> {
  client: LoopbackServiceClient<S>;

  constructor(apiService: ApiService<S>) {
    const loopbackClient: { [k: string]: LoopbackRouteHandler<any> } = {};
    Object.keys(apiService.serviceHandlerDefinition).forEach((key) => {
      const handler = apiService.serviceHandlerDefinition[key];
      loopbackClient[key] = LoopbackApiChannel.getLoopbackRouteHandler(
        handler.handler,
        handler.reqType,
        handler.respType,
      );
    });

    this.client = loopbackClient as LoopbackServiceClient<S>;
  }

  static getLoopbackRouteHandler<RequestType extends object, ResponseType extends object>(
    handler: IApiHandler<RequestType, ResponseType>,
    reqType: IMessageType<RequestType>,
    respType: IMessageType<ResponseType>,
  ): LoopbackRouteHandler<handleUnaryCall<RequestType, ResponseType>> {
    return async (request: RequestType): Promise<ResponseType> => {
      const requestObject = reqType.create(request);
      const result = await handler.handle({
        request: requestObject,
        headers: {},
      });

      return respType.create(result.response);
    };
  }
}
