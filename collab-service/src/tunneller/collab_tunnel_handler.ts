import { ServiceDefinition } from '@grpc/grpc-js';
import {
  collabTunnelServiceDefinition,
  ICollabTunnelService,
} from '../proto/collab-service.grpc-server';
import CollabTunnelController from './collab_tunnel_controller';

class CollabTunnelPubSub {
  public serviceDefinition: ServiceDefinition<ICollabTunnelService>;

  public serviceImplementation: ICollabTunnelService;

  constructor(controller: CollabTunnelController) {
    const collabService: ICollabTunnelService = {
      openStream: (call) => controller.pubSubOpenStreamHandler(call),
    };

    this.serviceDefinition = collabTunnelServiceDefinition;
    this.serviceImplementation = collabService;
  }
}

export default CollabTunnelPubSub;
