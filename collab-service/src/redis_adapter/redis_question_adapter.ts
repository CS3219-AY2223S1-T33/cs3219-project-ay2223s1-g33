import { RedisClientType } from 'redis';
import { Question } from '../proto/types';

async function setQuestionRedis(
  key: string,
  question: Question,
  publisher: RedisClientType,
) {
  await publisher.set(`qns-${key}`, JSON.stringify(question), {
    EX: 300,
    NX: true,
  });
}

async function getQuestionRedis(
  key: string,
  publisher: RedisClientType,
): Promise<string | null> {
  return publisher.get(`qns-${key}`);
}

export {
  setQuestionRedis,
  getQuestionRedis,
};
