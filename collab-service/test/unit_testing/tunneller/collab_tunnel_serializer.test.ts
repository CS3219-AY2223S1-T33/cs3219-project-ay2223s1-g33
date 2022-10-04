import CollabTunnelSerializer from '../../../src/tunneller/collab_tunnel_serializer';
import { ConnectionOpCode } from '../../../src/message_handler/internal/internal_message_types';

describe('Class-CollabTunnelSerializer', () => {
  const rawMsg = {
    sender: 'name',
    data: new Uint8Array(0),
    flag: ConnectionOpCode.JOIN,
  };
  const serializedMsg = JSON.stringify({
    sender: 'name',
    data: [],
    flag: ConnectionOpCode.JOIN,
  });

  const serializer = new CollabTunnelSerializer();

  test('Test serializer JOIN opcode', async () => {
    expect(serializer.serialize(rawMsg)).toStrictEqual(serializedMsg);
  });
  test('Test deserializer JOIN opcode', async () => {
    expect(serializer.deserialize(serializedMsg)).toStrictEqual(rawMsg);
  });
});
