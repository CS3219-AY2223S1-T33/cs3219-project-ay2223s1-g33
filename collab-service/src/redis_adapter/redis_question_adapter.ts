import { RedisClientType } from 'redis';
import { Question } from '../proto/types';

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
): Promise<string | null> {
  return publisher.get(`${redisPrefix}-${key}`);
}

export {
  setQuestionRedis,
  getQuestionRedis,
};
