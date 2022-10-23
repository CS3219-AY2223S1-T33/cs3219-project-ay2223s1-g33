import { UntypedServiceImplementation } from '@grpc/grpc-js';
import { IMessageType } from '@protobuf-ts/runtime';
import { ApiService, IApiHandler } from './api_server_types';
import { LoopbackRouteHandler, ILoopbackServiceChannel } from './loopback_server_types';

export default class LoopbackApiChannel<S extends UntypedServiceImplementation>
implements ILoopbackServiceChannel<S> {
  routes: { [route: string]: LoopbackRouteHandler };

  constructor() {
    this.routes = {};
  }

  registerServiceRoutes<T extends UntypedServiceImplementation>(apiService: ApiService<T>): void {
    Object.keys(apiService.serviceHandlerDefinition).forEach((key) => {
      const handler = apiService.serviceHandlerDefinition[key];
      this.routes[key] = LoopbackApiChannel.getLoopbackRouteHandler(
        handler.handler,
        handler.reqType,
      );
    });
  }

  static getLoopbackRouteHandler<RequestType extends object, ResponseType extends object>(
    handler: IApiHandler<RequestType, ResponseType>,
    reqType: IMessageType<RequestType>,
  ): (request: object) => Promise<object> {
    return async (request: object): Promise<object> => {
      const requestObject = reqType.create(request);
      const result = await handler.handle({
        request: requestObject,
        headers: {},
      });
      return result.response;
    };
  }

  async callRoute<T extends object, U extends object>(
    route: string,
    request: T,
    responseContainer: IMessageType<U>,
  ): Promise<U> {
    if (!(route in this.routes)) {
      throw new Error('No Such Route');
    }

    const response = await this.routes[route](request);
    return responseContainer.create(response);
  }
}
