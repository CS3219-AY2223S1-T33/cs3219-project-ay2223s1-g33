import { setQuestionRedis } from '../../../src/redis_adapter/redis_question_adapter';
import { Question } from '../../../src/proto/types';

const Redis = require('ioredis-mock');

describe('Function-Redis-Question setQuestionRedis', () => {
  test('Test question is saved on redis', async () => {
    const redis = new Redis();
    jest.spyOn(redis, 'set');
    const question: Question = {
      questionId: 1,
      name: '1',
      difficulty: 1,
      content: '1',
      solution: '1',
    };
    const key = 'key';
    await setQuestionRedis(key, question, redis);
    expect(redis.set).toBeCalledTimes(1);
    await redis.get(`qns-${key}`, (_err: any, result: any) => {
      expect(result)
        .toBe(JSON.stringify(question));
    });
  });
});
