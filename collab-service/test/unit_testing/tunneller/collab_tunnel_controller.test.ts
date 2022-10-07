import { Metadata } from '@grpc/grpc-js';
import { CollabTunnelController } from '../../../src/tunneller/collab_tunnel_controller';

describe('Class-TunnelController CollabTunnelController', () => {
  test('Function Test extractMetadata', () => {
    const meta = new Metadata();
    meta.set('X-Gateway-Proxy-Username', 'user');
    meta.set('X-Gateway-Proxy-Nickname', 'nick');
    meta.set('X-Gateway-Proxy-Room-Token', 'room');

    const data = CollabTunnelController.extractMetadata(meta);
    expect(data).toStrictEqual({
      roomToken: 'room',
      username: 'user',
      nickname: 'nick',
    });
  });
});
