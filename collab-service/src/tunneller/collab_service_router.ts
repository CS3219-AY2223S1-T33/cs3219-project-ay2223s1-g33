import { ServiceDefinition } from '@grpc/grpc-js';
import {
  collabTunnelServiceDefinition,
  ICollabTunnelService,
} from '../proto/collab-service.grpc-server';
import CollabTunnelController from './collab_tunnel_controller';

class CollabTunnelHandler {
  public serviceDefinition: ServiceDefinition<ICollabTunnelService>;

  public serviceImplementation: ICollabTunnelService;

  constructor(controller: CollabTunnelController) {
    const collabService: ICollabTunnelService = {
      openStream: (call) => controller.handleOpenStream(call),
    };

    this.serviceDefinition = collabTunnelServiceDefinition;
    this.serviceImplementation = collabService;
  }
}

export default CollabTunnelHandler;
