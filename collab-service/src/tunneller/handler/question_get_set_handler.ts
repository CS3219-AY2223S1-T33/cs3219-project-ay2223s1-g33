import { ServerDuplexStream } from '@grpc/grpc-js';
import { RedisClientType } from 'redis';
import { CollabTunnelRequest, CollabTunnelResponse } from '../../proto/collab-service';
import Logger from '../../utils/logger';
import { getQuestionRedis, setQuestionRedis } from '../../redis_adapter/redis_question_adapter';
import { makeDataResponse } from '../../message_handler/room/response_message_builder';
import { createQuestionRcvPackage } from '../../message_handler/room/connect_message_builder';
import { IQuestionAgent } from '../../question_client/question_agent_types';

/**
 * Creates and sends question stored in Redis to client
 * @param roomId
 * @param call
 * @param pub
 * @private
 */
async function sendQuestionFromRedis(
  call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
  pub: RedisClientType,
  roomId: string,
) {
  const finalQuestion = await getQuestionRedis(roomId, pub);
  call.write(makeDataResponse(createQuestionRcvPackage(finalQuestion)));
}

/**
 * Handles question retrieval from client & saves unto Redis
 * @param difficulty
 * @param roomId
 * @param call
 * @param questionAgent
 * @param pub
 */
async function handleQuestion(
  call: ServerDuplexStream<CollabTunnelRequest, CollabTunnelResponse>,
  questionAgent: IQuestionAgent,
  pub: RedisClientType,
  difficulty: number,
  roomId: string,
) {
  const questionResponse = await questionAgent.getQuestionByDifficulty(difficulty);
  if (questionResponse.errorMessage || questionResponse.question === undefined) {
    Logger.error(`Question: ${questionResponse.errorMessage}`);
    return;
  }
  await setQuestionRedis(roomId, questionResponse.question, pub);
  await sendQuestionFromRedis(call, pub, roomId);
}

export {
  sendQuestionFromRedis,
  handleQuestion,
};
