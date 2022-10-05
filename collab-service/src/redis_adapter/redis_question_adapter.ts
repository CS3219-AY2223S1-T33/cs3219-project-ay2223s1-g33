import { RedisClientType } from 'redis';
import { Question } from '../proto/types';

async function setQuestionRedis(
  key: string,
  question: Question | undefined,
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
): Promise<string> {
  const question = await publisher.get(`qns-${key}`);
  if (question === null) {
    // No question found
    return '';
  }
  return question;
}

export {
  setQuestionRedis,
  getQuestionRedis,
};
