import { ServerDuplexStream } from '@grpc/grpc-js';
import { CollabTunnelRequest, CollabTunnelResponse } from '../../proto/collab-service';
import { TunnelPubSub } from '../../redis_adapter/redis_pubsub_types';
import {
  ConnectionOpCode,
  TunnelMessage,
} from '../../message_handler/internal/internal_message_types';
import IAttemptCache from '../../history_handler/attempt_cache_types';
import Logger from '../../utils/logger';
import {
  createAckMessage, createDataMessage,
  createHelloMessage,
} from '../../message_handler/internal/internal_message_builder';
import { makeDataResponse } from '../../message_handler/room/response_message_builder';
import { saveAttempt } from './attempt_create_save_handler';

/**
 * Handles subscribed message received from pubsub
 * @param call
 * @param pubsub
 * @param attemptCache
 * @param message
 * @param username
 * @param nickname
 */
async function handleWrite(
  call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
  pubsub: TunnelPubSub<TunnelMessage>,
  attemptCache: IAttemptCache,
  message: TunnelMessage,
  username: string,
  nickname: string,
) {
  // Prevent self echo
  if (message.sender === username) {
    return;
  }
  // Handle internal message cases;
  let dataToSend = message.data;
  switch (message.flag) {
    case ConnectionOpCode.DATA: // Receive normal, Do nothing
      break;
    case ConnectionOpCode.JOIN: // Receive A, Send B
      Logger.info(`${username} received JOIN from ${message.sender}`);
      await pubsub.pushMessage(createAckMessage(username, nickname));
      break;
    case ConnectionOpCode.ACK: // Receive B, 'Connected'
      Logger.info(`${username} received ACK from ${message.sender}`);
      break;
    case ConnectionOpCode.ROOM_DISCOVER: // Receive ARP discovery, Send 'Who Am I'
      Logger.info(`${username} received ARP from ${message.sender}`);
      await pubsub.pushMessage(createHelloMessage(username));
      break;
    case ConnectionOpCode.ROOM_HELLO: // Receive 'Who Am I', Save attempt
      Logger.info(`${username} received WMI from ${message.sender}`);
      // Complete saving snapshot
      attemptCache.setUsers([username, message.sender]);
      dataToSend = await saveAttempt(attemptCache);
      await pubsub.pushMessage(createDataMessage(username, dataToSend));
      break;
    default:
      Logger.error('Unknown connection flag');
      return;
  }
  call.write(makeDataResponse(dataToSend));
}

/**
 * Creates encapsulated lambda for writing subscribed data to client
 * @param call
 * @param pubsub
 * @param attemptCache
 * @param username
 * @param nickname
 */
function createCallWriter(
  call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
  pubsub: TunnelPubSub<TunnelMessage>,
  attemptCache: IAttemptCache,
  username: string,
  nickname: string,
): (data: TunnelMessage) => void {
  return async (message: TunnelMessage): Promise<void> => {
    await handleWrite(
      call,
      pubsub,
      attemptCache,
      message,
      username,
      nickname,
    );
  };
}

export default createCallWriter;
