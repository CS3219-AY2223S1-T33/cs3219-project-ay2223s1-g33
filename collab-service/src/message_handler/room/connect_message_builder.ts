import * as encoding from 'lib0/encoding';

export const OPCODE_TERMINATE_WITH_ERROR = 4;
export const OPCODE_USER_JOIN = 5;
export const OPCODE_USER_LEAVE = 6;
export const OPCODE_QUESTION_REQ = 8;
export const OPCODE_QUESTION_RCV = 9;
export const OPCODE_SAVE_CODE_REQ = 10;
export const OPCODE_SAVE_CODE_ACK = 11;
export const OPCODE_EXECUTE_REQ = 13;
export const OPCODE_EXECUTE_PENDING = 14;
export const OPCODE_EXECUTE_COMPLETE = 15;

function encodeContentOpcode(content: string, opcode: number): Uint8Array {
  const encoder = encoding.createEncoder();
  encoding.writeUint8(encoder, opcode);
  encoding.writeVarString(encoder, content);
  return encoding.toUint8Array(encoder);
}

function encodeOpcodeOnly(opcode: number): Uint8Array {
  return new Uint8Array([opcode]);
}

function createConnectedPackage(username: string): Uint8Array {
  return encodeContentOpcode(username, OPCODE_USER_JOIN);
}

function createDisconnectedPackage(username: string): Uint8Array {
  return encodeContentOpcode(username, OPCODE_USER_LEAVE);
}

function encodeQuestion(qns: string, completed: number, opcode: number):
Uint8Array {
  const encoder = encoding.createEncoder();
  encoding.writeUint8(encoder, opcode);
  encoding.writeVarString(encoder, qns);
  encoding.writeUint8(encoder, completed);
  return encoding.toUint8Array(encoder);
}

function createQuestionRcvPackage(question: string, isCompleted: boolean): Uint8Array {
  const completed = isCompleted ? 1 : 0;
  return encodeQuestion(question, completed, OPCODE_QUESTION_RCV);
}

function createSaveCodeReqPackage(): Uint8Array {
  return encodeOpcodeOnly(OPCODE_SAVE_CODE_REQ);
}

function createSaveCodeAckPackage(response: string): Uint8Array {
  return encodeContentOpcode(response, OPCODE_SAVE_CODE_ACK);
}

function createSaveCodeFailedPackage(): Uint8Array {
  return encodeContentOpcode('Save failed', OPCODE_SAVE_CODE_ACK);
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
  createSaveCodeFailedPackage,
  readConnectionOpCode,
};
