import { RedisClientType } from 'redis';
import { Question } from '../proto/types';
import Logger from '../utils/logger';
import { serializeQuestion } from '../question_client/question_serializer';

const REDIS_PREFIX = 'collab-qns';
const REFRESH_INTERVAL = 3 * 20;

/**
 * Sets question into Redis of given key
 * @param key
 * @param question
 * @param publisher
 */
async function setQuestionRedis(
  key: string,
  question: Question,
  publisher: RedisClientType,
) {
  await publisher.set(`${REDIS_PREFIX}-${key}`, serializeQuestion(question), {
    EX: REFRESH_INTERVAL,
    NX: true,
  });
}

/**
 * Gets question from Redis of given key
 * @param key
 * @param publisher
 */
async function getQuestionRedis(
  key: string,
  publisher: RedisClientType,
): Promise<string> {
  const qns = await publisher.get(`${REDIS_PREFIX}-${key}`);
  if (qns) {
    return qns;
  }
  Logger.error(`No question of room ${key} found`);
  return '';
}

/**
 * Refreshes expiration of Redis question of given key
 * @param key
 * @param publisher
 */
async function refreshRedisQuestionExpiry(
  key: string,
  publisher: RedisClientType,
) {
  await publisher.expire(`${REDIS_PREFIX}-${key}`, REFRESH_INTERVAL);
}

export {
  setQuestionRedis,
  getQuestionRedis,
  refreshRedisQuestionExpiry,
};
