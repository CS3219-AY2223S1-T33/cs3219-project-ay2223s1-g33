import {
  createAckMessage,
  createJoinMessage,
  createDataMessage,
} from '../../../../src/message_handler/internal/internal_message_builder';
import {
  ConnectionOpCode,
} from '../../../../src/message_handler/internal/internal_message_types';
import {
  createConnectedPackage,
} from '../../../../src/message_handler/room/connect_message_builder';

describe('Function-Message-Internal createJoinMessage', () => {
  test('Test creating username', () => {
    const name = 'randomName';
    const nickname = 'randomNick';
    const msg = createJoinMessage(name, nickname);
    expect(msg)
      .toStrictEqual({
        sender: name,
        data: createConnectedPackage(nickname),
        flag: ConnectionOpCode.JOIN,
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
        data: createConnectedPackage(nickname),
        flag: ConnectionOpCode.ACK,
      });
  });
});

describe('Function-Message-Internal createDataMessage', () => {
  test('Test creating data', () => {
    const name = 'randomName';
    const data = Buffer.from([123]);
    const msg = createDataMessage(name, data);
    expect(msg)
      .toStrictEqual({
        sender: name,
        data,
        flag: ConnectionOpCode.DATA,
      });
  });
});
