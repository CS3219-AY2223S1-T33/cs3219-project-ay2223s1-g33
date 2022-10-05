import * as encoding from 'lib0/encoding';

export const OPCODE_TERMINATE_WITH_ERROR = 4;
export const OPCODE_USER_JOIN = 5;
export const OPCODE_USER_LEAVE = 6;
export const OPCODE_QUESTION_REQ = 8;
export const OPCODE_QUESTION_RCV = 9;
export const OPCODE_SAVE_CODE_SEND = 10;
export const OPCODE_SAVE_CODE_ACK = 11;

function createConnectionAlertMessage(username: string, opcode: number): Uint8Array {
  const encoder = encoding.createEncoder();
  encoding.writeUint8(encoder, opcode);
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
