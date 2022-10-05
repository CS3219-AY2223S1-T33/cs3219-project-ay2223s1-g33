import { ConnectionOpCode, TunnelMessage } from './internal_message_types';
import { createConnectedPackage, createQuestionPackage } from '../room/connect_message_builder';

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

function createQuestionRcvPackage(username: string, question: string): TunnelMessage {
  return {
    sender: username,
    data: createQuestionPackage(question),
    flag: ConnectionOpCode.ACK,
  };
}

export {
  createJoinMessage,
  createAckMessage,
  createQuestionRcvPackage,
};
