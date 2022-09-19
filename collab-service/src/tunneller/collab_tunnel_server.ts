import { ServiceDefinition, UntypedServiceImplementation } from '@grpc/grpc-js';
import { ICollabTunnelService, collabTunnelServiceDefinition } from '../proto/collab-service.grpc-server';
import { CollabTunnelRequest } from '../proto/collab-service';
import CollabTunnelPubSub from '../pub_sub/collab_tunnel_pubsub';

// Central source of pubsub
const pubSub = new CollabTunnelPubSub();

function pubSubOpenStream(call: any) {
  // When stream opens
  const roomId = call.metadata.get('roomId')[0];
  const username = call.metadata.get('username')[0];
  const cTopic = pubSub.createTopic(roomId);
  cTopic?.createSubscription(username, call);

  // When data is detected
  call.on('data', (request: CollabTunnelRequest) => {
    cTopic?.push(request);
  });

  // When stream closes
  call.on('end', () => {
    pubSub.clean(call);
    call.end();
  });
}

class CollabTunnelStream {
  public serviceDefinition: ServiceDefinition<ICollabTunnelService>;

  public serviceImplementation: UntypedServiceImplementation;

  constructor() {
    this.serviceDefinition = collabTunnelServiceDefinition;
    this.serviceImplementation = {
      OpenStream: pubSubOpenStream,
    };
  }
}

export default CollabTunnelStream;
