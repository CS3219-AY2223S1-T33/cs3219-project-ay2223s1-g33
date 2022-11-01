import { decoding } from 'lib0';
import {
  OPCODE_USER_LEAVE,
  OPCODE_USER_JOIN,
  createDisconnectedPackage,
  createConnectedPackage, createQuestionRcvPackage, OPCODE_QUESTION_RCV,
} from '../../../../src/message_handler/room/connect_message_builder';

describe('Function-Message-Room createDisconnectedPackage', () => {
  test('Test encoding username and leave code', () => {
    const expectedUsername = 'username';
    const msg = createDisconnectedPackage(expectedUsername);

    const decoder = decoding.createDecoder(msg);
    const opcode = decoding.readUint8(decoder);
    const username = decoding.readVarString(decoder);
    expect(opcode)
      .toBe(OPCODE_USER_LEAVE);
    expect(username)
      .toBe(expectedUsername);
  });
});

describe('Function-Message-Room createConnectedPackage', () => {
  test('Test encoding username and join code', () => {
    const expectedUsername = 'username';
    const msg = createConnectedPackage(expectedUsername);

    const decoder = decoding.createDecoder(msg);
    const opcode = decoding.readUint8(decoder);
    const username = decoding.readVarString(decoder);
    expect(opcode)
      .toBe(OPCODE_USER_JOIN);
    expect(username)
      .toBe(expectedUsername);
  });
});

describe('Function-Message-Room createQuestionRcvPackage', () => {
  test('Test encoding question receive', () => {
    const expectedQuestion = 'question';
    const msg = createQuestionRcvPackage(expectedQuestion, true);

    const decoder = decoding.createDecoder(msg);
    const opcode = decoding.readUint8(decoder);
    const question = decoding.readVarString(decoder);
    expect(opcode)
      .toBe(OPCODE_QUESTION_RCV);
    expect(question)
      .toBe(expectedQuestion);
  });
});
