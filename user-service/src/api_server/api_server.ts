/*
  Revision 4 of the API server framework.
*/

import { UntypedServiceImplementation } from '@grpc/grpc-js';
import { ApiService, IApiServer, IProtocolServer } from './api_server_types';

class ApiServer implements IApiServer {
  protocolServers: IProtocolServer[];

  constructor(...protoServers: IProtocolServer[]) {
    if (protoServers === undefined) {
      this.protocolServers = [];
      return;
    }

    this.protocolServers = protoServers;
  }

  bind(): void {
    this.protocolServers.forEach((server) => {
      server.bind();
    });
  }

  registerServiceRoutes<T extends UntypedServiceImplementation>(apiService: ApiService<T>): void {
    this.protocolServers.forEach((server) => {
      server.registerServiceRoutes(apiService);
    });
  }
}

function createApiServer(...protoServers: IProtocolServer[]): IApiServer {
  return new ApiServer(...protoServers);
}

export default createApiServer;
