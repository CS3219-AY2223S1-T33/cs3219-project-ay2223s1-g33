import {
  createAckMessage,
  createJoinMessage,
} from '../../../../src/message_handler/internal/internal_message_builder';
import {
  ConnectionFlag,
} from '../../../../src/message_handler/internal/internal_message_types';

describe('Function-Message-Internal createJoinMessage', () => {
  test('Test creating username', () => {
    const name = 'randomName';
    const nickname = 'randomNick';
    const msg = createJoinMessage(name, nickname);
    expect(msg)
      .toStrictEqual({
        sender: name,
        nick: nickname,
        data: new Uint8Array(0),
        flag: ConnectionFlag.JOIN,
      });
  });
});

describe('Function-Message-Internal createAckMessage', () => {
  test('Test creating username', () => {
    const name = 'randomName';
    const nickname = 'randomNick';
    const msg = createAckMessage(name, nickname);
    expect(msg)
      .toStrictEqual({
        sender: name,
        nick: nickname,
        data: new Uint8Array(0),
        flag: ConnectionFlag.ACK,
      });
  });
});
