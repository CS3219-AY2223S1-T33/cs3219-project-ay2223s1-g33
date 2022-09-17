import { ServiceDefinition, UntypedServiceImplementation } from '@grpc/grpc-js';
import { ITunnelService, tunnelServiceDefinition } from '../proto/tunnel-service.grpc-server';
import { TunnelServiceRequest } from '../proto/tunnel-service';
import CollabTunnelPubSub from '../pub_sub/collab_tunnel_pubsub';

const pubSub = new CollabTunnelPubSub();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
let count = -1;
const allUsers = ['user1', 'user2'];
const fakeRoomId = ['12345678', '12345678'];

function pubSubOpenStream(call: any) {
  // When data is detected
  call.on('data', (request: TunnelServiceRequest) => {
    // Access fake username & room_id
    count += 1;
    count %= 2;
    const username = allUsers[count];
    const roomId = fakeRoomId[count];

    const cTopic = pubSub.createTopic(roomId);
    try {
      cTopic?.createSubscription(username, call);
      cTopic?.push(request);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
  });
  // When stream ends
  call.on('end', () => {
    call.end();
  });
}

class CollabTunnelStream {
  public serviceDefinition: ServiceDefinition<ITunnelService>;

  public serviceImplementation: UntypedServiceImplementation;

  constructor() {
    this.serviceDefinition = tunnelServiceDefinition;
    this.serviceImplementation = {
      OpenStream: pubSubOpenStream,
    };
  }
}

export default CollabTunnelStream;
