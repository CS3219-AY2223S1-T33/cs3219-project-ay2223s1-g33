import { ConnectionFlag, TunnelMessage } from './internal_message_types';

const emptyData = new Uint8Array(0);

function createJoinMessage(username: string, nickname: string): TunnelMessage {
  return {
    sender: username,
    nick: nickname,
    data: emptyData,
    flag: ConnectionFlag.JOIN,
  };
}

function createAckMessage(username: string, nickname: string): TunnelMessage {
  return {
    sender: username,
    nick: nickname,
    data: emptyData,
    flag: ConnectionFlag.ACK,
  };
}
export {
  createJoinMessage,
  createAckMessage,
};
