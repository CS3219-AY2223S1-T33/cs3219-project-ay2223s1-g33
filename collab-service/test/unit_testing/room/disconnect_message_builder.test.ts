import { decoding } from 'lib0';
import {
  createDisconnectMessage,
  OPCODE_USER_LEAVE,
} from '../../../src/room/disconnect_message_builder';

describe('Function-Room createDisconnectMessage', () => {
  it(' Test encoding username and leave code', () => {
    const expectedUsername = 'username';
    const msg = createDisconnectMessage(expectedUsername);

    const decoder = decoding.createDecoder(msg);
    const opcode = decoding.readVarInt(decoder);
    const username = decoding.readVarString(decoder);
    expect(opcode).toBe(OPCODE_USER_LEAVE);
    expect(username).toBe(expectedUsername);
  });
});
