import { ConnectionOpCode, TunnelMessage } from './internal_message_types';
import { createConnectedMessage } from '../room/connect_message_builder';

function createJoinMessage(username: string, nickname: string): TunnelMessage {
  return {
    sender: username,
    data: createConnectedMessage(nickname),
    flag: ConnectionOpCode.JOIN,
  };
}

function createAckMessage(username: string, nickname: string): TunnelMessage {
  return {
    sender: username,
    data: createConnectedMessage(nickname),
    flag: ConnectionOpCode.ACK,
  };
}
export {
  createJoinMessage,
  createAckMessage,
};
