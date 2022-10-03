import { ServerDuplexStream } from '@grpc/grpc-js';
import { CollabTunnelController } from '../../../src/tunneller/collab_tunnel_controller';
import { CollabTunnelRequest, CollabTunnelResponse } from '../../../src/proto/collab-service';

jest.mock('@grpc/grpc-js');
const mockedFoo = jest.mocked(ServerDuplexStream, true);

describe('Class-CollabTunnelController', () => {
  test('Function Test extractMetadata', () => {
    const caller = (call) => CollabTunnelController.extractMetadata(call);
    CollabTunnelController.extractMetadata(call);
  });
});
