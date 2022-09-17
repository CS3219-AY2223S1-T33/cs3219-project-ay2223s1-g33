import { ServiceDefinition, UntypedServiceImplementation } from '@grpc/grpc-js';
import { ITunnelService, tunnelServiceDefinition } from '../proto/tunnel-service.grpc-server';
import doOpenStream from './collab_tunnel_handler';

class CollabTunnelStream {
  public serviceDefinition: ServiceDefinition<ITunnelService>;

  public serviceImplementation: UntypedServiceImplementation;

  constructor() {
    this.serviceDefinition = tunnelServiceDefinition;
    this.serviceImplementation = {
      OpenStream: doOpenStream,
    };
  }
}

export default CollabTunnelStream;
