import * as encoding from 'lib0/encoding';

export const OPCODE_USER_JOIN = 4;
export const OPCODE_USER_LEAVE = 5;

function createConnectionAlertMessage(username: string, opcode: number): Uint8Array {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, opcode);
  encoding.writeVarString(encoder, username);
  return encoding.toUint8Array(encoder);
}

function createConnectedMessage(username: string): Uint8Array {
  return createConnectionAlertMessage(username, OPCODE_USER_JOIN);
}

function createDisconnectedMessage(username: string): Uint8Array {
  return createConnectionAlertMessage(username, OPCODE_USER_LEAVE);
}

export {
  createConnectedMessage,
  createDisconnectedMessage,
};
