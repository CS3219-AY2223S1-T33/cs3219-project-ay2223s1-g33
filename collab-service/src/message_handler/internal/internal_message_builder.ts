import { ConnectionOpCode, TunnelMessage } from './internal_message_types';
import {
  createConnectedPackage,
  createSaveCodeReqPackage,
  createSaveCodeAckPackage,
} from '../room/connect_message_builder';

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

function createDiscoverMessage(username: string): TunnelMessage {
  return {
    sender: username,
    data: createSaveCodeReqPackage(),
    flag: ConnectionOpCode.ROOM_DISCOVER,
  };
}

function createHelloMessage(username: string): TunnelMessage {
  return {
    sender: username,
    data: createSaveCodeAckPackage(),
    flag: ConnectionOpCode.ROOM_HELLO,
  };
}

export {
  createJoinMessage,
  createAckMessage,
  createDataMessage,
  createDiscoverMessage,
  createHelloMessage,
};
