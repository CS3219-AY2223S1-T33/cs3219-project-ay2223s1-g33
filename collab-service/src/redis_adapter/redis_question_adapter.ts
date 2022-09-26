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

export default setQuestionRedis;
