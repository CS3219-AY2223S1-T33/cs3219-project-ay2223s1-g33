import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

export const OPCODE_TERMINATE_WITH_ERROR = 4;
export const OPCODE_USER_JOIN = 5;
export const OPCODE_USER_LEAVE = 6;
export const OPCODE_QUESTION_REQ = 8;
export const OPCODE_QUESTION_RCV = 9;
export const OPCODE_SAVE_CODE_SEND = 10;
export const OPCODE_SAVE_CODE_ACK = 11;

function createConnectionAlertPackage(content: string, opcode: number): Uint8Array {
  const encoder = encoding.createEncoder();
  encoding.writeUint8(encoder, opcode);
  encoding.writeVarString(encoder, content);
  return encoding.toUint8Array(encoder);
}

function createConnectedPackage(username: string): Uint8Array {
  return createConnectionAlertPackage(username, OPCODE_USER_JOIN);
}

function createDisconnectedPackage(username: string): Uint8Array {
  return createConnectionAlertPackage(username, OPCODE_USER_LEAVE);
}

function createQuestionRcvPackage(question: string): Uint8Array {
  return createConnectionAlertPackage(question, OPCODE_QUESTION_RCV);
}

/*
 * Extracts opcode of given data package
 * @param data
 */
function readConnectionOpCode(data: Uint8Array): number {
  const decoder = decoding.createDecoder(data);
  return decoding.readUint8(decoder);
}

export {
  createConnectedPackage,
  createDisconnectedPackage,
  createQuestionRcvPackage,
  readConnectionOpCode,
};
