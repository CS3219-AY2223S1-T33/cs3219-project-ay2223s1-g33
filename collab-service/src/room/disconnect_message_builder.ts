import * as encoding from 'lib0/encoding';

export const OPCODE_USER_LEAVE = 5;

function createDisconnectMessage(username: string): Uint8Array {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, OPCODE_USER_LEAVE);
  encoding.writeVarString(encoder, username);

  return encoding.toUint8Array(encoder);
}

export {
  createDisconnectMessage,
};
