import * as encoding from 'lib0/encoding';
import * as decoding from 'lib0/decoding';

export const OPCODE_TERMINATE_WITH_ERROR = 4;
export const OPCODE_USER_JOIN = 5;
export const OPCODE_USER_LEAVE = 6;
export const OPCODE_QUESTION_REQ = 8;
export const OPCODE_QUESTION_RCV = 9;
export const OPCODE_SAVE_CODE_REQ = 10;
export const OPCODE_SAVE_CODE_ACK = 11;

function encodeContentOpcode(content: string, opcode: number): Uint8Array {
  const encoder = encoding.createEncoder();
  encoding.writeUint8(encoder, opcode);
  encoding.writeVarString(encoder, content);
  return encoding.toUint8Array(encoder);
}

function encodeOpcodeOnly(opcode: number): Uint8Array {
  const encoder = encoding.createEncoder();
  encoding.writeUint8(encoder, opcode);
  return encoding.toUint8Array(encoder);
}

function createConnectedPackage(username: string): Uint8Array {
  return encodeContentOpcode(username, OPCODE_USER_JOIN);
}

function createDisconnectedPackage(username: string): Uint8Array {
  return encodeContentOpcode(username, OPCODE_USER_LEAVE);
}

function createQuestionRcvPackage(question: string): Uint8Array {
  return encodeContentOpcode(question, OPCODE_QUESTION_RCV);
}

function createSaveCodeReqPackage(): Uint8Array {
  return encodeOpcodeOnly(OPCODE_SAVE_CODE_REQ);
}

function createSaveCodeAckPackage(): Uint8Array {
  return encodeOpcodeOnly(OPCODE_SAVE_CODE_ACK);
}

function decodeAttempt(data: Uint8Array) {
  const decoder = decoding.createDecoder(data.slice(1, data.length)); // Skip opcode
  const lang = decoding.readVarString(decoder);
  const content = decoding.readVarString(decoder);
  return {
    lang,
    content,
  };
}

/**
 * Extracts opcode of given data package
 * @param data
 */
function readConnectionOpCode(data: Uint8Array): number {
  return data[0];
}

export {
  createConnectedPackage,
  createDisconnectedPackage,
  createQuestionRcvPackage,
  createSaveCodeReqPackage,
  createSaveCodeAckPackage,
  readConnectionOpCode,
  decodeAttempt,
};
