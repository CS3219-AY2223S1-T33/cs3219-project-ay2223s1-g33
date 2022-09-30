import { ConnectionFlag, TunnelMessage } from './internal_message_types';
import { createConnectedMessage } from '../room/connect_message_builder';

function createJoinMessage(username: string, nickname: string): TunnelMessage {
  return {
    sender: username,
    data: createConnectedMessage(nickname),
    flag: ConnectionFlag.JOIN,
  };
}

function createAckMessage(username: string, nickname: string): TunnelMessage {
  return {
    sender: username,
    data: createConnectedMessage(nickname),
    flag: ConnectionFlag.ACK,
  };
}
export {
  createJoinMessage,
  createAckMessage,
};
