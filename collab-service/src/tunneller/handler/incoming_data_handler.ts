import { ServerDuplexStream } from '@grpc/grpc-js';
import { RedisClientType } from 'redis';
import { CollabTunnelRequest, CollabTunnelResponse } from '../../proto/collab-service';
import { TunnelPubSub } from '../../redis_adapter/redis_pubsub_types';
import { TunnelMessage } from '../../message_handler/internal/internal_message_types';
import IAttemptCache from '../../history_handler/attempt_cache_types';
import { isHeartbeat, makeDataResponse } from '../../message_handler/room/response_message_builder';
import {
  OPCODE_QUESTION_REQ, OPCODE_SAVE_CODE_REQ,
  readConnectionOpCode,
} from '../../message_handler/room/connect_message_builder';
import Logger from '../../utils/logger';
import { sendQuestionFromRedis } from './question_get_set_handler';
import {
  createDataMessage,
  createDiscoverMessage,
} from '../../message_handler/internal/internal_message_builder';
import { getQuestionRedis } from '../../redis_adapter/redis_question_adapter';
import { createUploader, saveAttempt } from './attempt_create_save_handler';
import { IHistoryAgent } from '../../history_client/history_agent_types';

const SUBMISSION_WAIT = 4 * 1000;

/**
 * Handles save code request by client
 * @param roomId
 * @param attemptCache
 * @param request
 * @param pubsub
 * @param historyAgent
 * @param pub
 * @param username
 * @param call
 * @private
 */
async function handleIncomingSaveRequest(
  call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
  pubsub: TunnelPubSub<TunnelMessage>,
  pub: RedisClientType,
  attemptCache: IAttemptCache,
  historyAgent: IHistoryAgent,
  username: string,
  roomId: string,
  request: CollabTunnelRequest,
) {
  // Prepare saving snapshot
  const questionResponse = await getQuestionRedis(roomId, pub);
  attemptCache.setQuestion(questionResponse);
  attemptCache.setLangContent(request.data);
  attemptCache.setUploader(createUploader(historyAgent));

  // Retrieve other user
  await pubsub.pushMessage(createDiscoverMessage(username));

  // Wait for other user response
  await new Promise((resolve) => {
    setTimeout(resolve, SUBMISSION_WAIT);
  });
  // If no response, start individual submission
  if (!attemptCache.isEmpty()) {
    attemptCache.setUsers([username]);
    const dataToSend = await saveAttempt(attemptCache);
    call.write(makeDataResponse(dataToSend));
  }
}

/**
 * Handles data package sent by client based on package opcode received
 * @param call
 * @param pubsub
 * @param pub
 * @param attemptCache
 * @param historyAgent
 * @param username
 * @param roomId
 * @param request
 */
async function handleIncomingData(
  call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
  pubsub: TunnelPubSub<TunnelMessage>,
  pub: RedisClientType,
  attemptCache: IAttemptCache,
  historyAgent: IHistoryAgent,
  username: string,
  roomId: string,
  request: CollabTunnelRequest,
) {
  // Ignore heartbeat
  if (isHeartbeat(request.flags)) {
    return;
  }
  // Handle external connection message cases
  switch (readConnectionOpCode(request.data)) {
    case OPCODE_QUESTION_REQ: // Retrieve question, send back to user
      Logger.info(`${username} requested for question`);
      await sendQuestionFromRedis(call, pub, roomId);
      break;
    case OPCODE_SAVE_CODE_REQ: // Snapshot code
      Logger.info(`${username} requested for saving code`);
      await handleIncomingSaveRequest(
        call,
        pubsub,
        pub,
        attemptCache,
        historyAgent,
        username,
        roomId,
        request,
      );
      break;
    default: // Normal data, push to publisher
      await pubsub.pushMessage(createDataMessage(username, request.data));
  }
}

export default handleIncomingData;
