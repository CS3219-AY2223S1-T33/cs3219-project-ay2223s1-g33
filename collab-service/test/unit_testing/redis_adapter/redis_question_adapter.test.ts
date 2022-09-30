import setQuestionRedis from '../../../src/redis_adapter/redis_question_adapter';
import { Question } from '../../../src/proto/types';

const redisMock = require('redis-mock');

describe('Function-Redis-Question setQuestionRedis', () => {
  test('Test question is saved on redis', async () => {
    const redis = redisMock.createClient();
    const question: Question = {
      questionId: 1,
      name: '1',
      difficulty: 1,
      content: '1',
      solution: '1',
    };
    const key = 'key';
    await setQuestionRedis(key, question, redis);
    await redis.get(`qns-${key}`, (_err: any, result: any) => {
      expect(result)
        .toBe(JSON.stringify(question));
    });
  });
});
