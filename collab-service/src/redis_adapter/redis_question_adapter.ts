import { RedisClientType } from 'redis';
import { Question } from '../proto/types';
import Logger from '../utils/logger';

const REDIS_PREFIX = 'collab-qns';
const HEARTBEAT_INTERVAL = 20;

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
  await publisher.set(`${REDIS_PREFIX}-${key}`, JSON.stringify(question), {
    EX: HEARTBEAT_INTERVAL,
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
 * Gets question from Redis of given key
 * @param key
 * @param publisher
 */
async function heartbeatQuestionRedis(
  key: string,
  publisher: RedisClientType,
) {
  await publisher.expire(`${REDIS_PREFIX}-${key}`, HEARTBEAT_INTERVAL);
}

export {
  setQuestionRedis,
  getQuestionRedis,
  heartbeatQuestionRedis,
};
