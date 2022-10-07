import { UntypedServiceImplementation } from '@grpc/grpc-js';
import { IMessageType } from '@protobuf-ts/runtime';
import { LoopbackRouteHandler, ApiService, ILoopbackServiceChannel } from './api_server_types';

export default class LoopbackApiChannel<S extends UntypedServiceImplementation>
implements ILoopbackServiceChannel<S> {
  routes: { [route: string]: LoopbackRouteHandler };

  constructor() {
    this.routes = {};
  }

  registerServiceRoutes<T extends UntypedServiceImplementation>(apiService: ApiService<T>): void {
    Object.keys(apiService.serviceHandlerDefinition).forEach((key) => {
      this.routes[key] = apiService.serviceHandlerDefinition[key].loopbackRouteHandler;
    });
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
