import { ConnectionOpCode, TunnelMessage } from './internal_message_types';
import { createConnectedPackage } from '../room/connect_message_builder';

function createJoinMessage(username: string, nickname: string): TunnelMessage {
  return {
    sender: username,
    data: createConnectedPackage(nickname),
    flag: ConnectionOpCode.JOIN,
  };
}

function createAckMessage(username: string, nickname: string): TunnelMessage {
  return {
    sender: username,
    data: createConnectedPackage(nickname),
    flag: ConnectionOpCode.ACK,
  };
}

function createDataMessage(username: string, data: Uint8Array): TunnelMessage {
  return {
    sender: username,
    data,
    flag: ConnectionOpCode.DATA,
  };
}

export {
  createJoinMessage,
  createAckMessage,
  createDataMessage,
};
