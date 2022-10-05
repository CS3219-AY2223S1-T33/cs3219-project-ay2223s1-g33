import { decoding } from 'lib0';
import {
  OPCODE_USER_LEAVE,
  OPCODE_USER_JOIN,
  createDisconnectedPackage,
  createConnectedPackage,
} from '../../../../src/message_handler/room/connect_message_builder';

describe('Function-Message-Room createDisconnectedMessage', () => {
  test('Test encoding username and leave code', () => {
    const expectedUsername = 'username';
    const msg = createDisconnectedPackage(expectedUsername);

    const decoder = decoding.createDecoder(msg);
    const opcode = decoding.readVarInt(decoder);
    const username = decoding.readVarString(decoder);
    expect(opcode)
      .toBe(OPCODE_USER_LEAVE);
    expect(username)
      .toBe(expectedUsername);
  });
});

describe('Function-Message-Room createConnectedMessage', () => {
  test('Test encoding username and join code', () => {
    const expectedUsername = 'username';
    const msg = createConnectedPackage(expectedUsername);

    const decoder = decoding.createDecoder(msg);
    const opcode = decoding.readVarInt(decoder);
    const username = decoding.readVarString(decoder);
    expect(opcode)
      .toBe(OPCODE_USER_JOIN);
    expect(username)
      .toBe(expectedUsername);
  });
});
