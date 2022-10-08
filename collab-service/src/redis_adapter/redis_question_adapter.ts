import { RedisClientType } from 'redis';
import { Question } from '../proto/types';
import Logger from '../utils/logger';

const redisPrefix = 'collab-qns';

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
  await publisher.set(`${redisPrefix}-${key}`, JSON.stringify(question), {
    EX: 300,
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
  const qns = await publisher.get(`${redisPrefix}-${key}`);
  if (qns) {
    return qns;
  }
  Logger.error(`No question of room ${key} found`);
  return '';
}

export {
  setQuestionRedis,
  getQuestionRedis,
};
