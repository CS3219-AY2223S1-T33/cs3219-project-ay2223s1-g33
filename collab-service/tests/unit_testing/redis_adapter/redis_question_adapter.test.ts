import {
  getQuestionRedis,
  setQuestionRedis,
} from '../../../src/redis_adapter/redis_question_adapter';
import { Question } from '../../../src/proto/types';

const Redis = require('ioredis-mock');

const question: Question = {
  questionId: 1,
  name: '1',
  difficulty: 1,
  content: '1',
  solution: '1',
  executionInput: 'Input',
};

const key = 'key';

describe('Function-Redis-Question setQuestionRedis', () => {
  test('Test question is saved on redis', async () => {
    const redis = new Redis();
    jest.spyOn(redis, 'set');
    await setQuestionRedis(key, question, redis);
    expect(redis.set).toBeCalledTimes(1);
    await redis.get(`collab-qns-${key}`, (_err: any, result: any) => {
      expect(result).toBe(JSON.stringify(question));
    });
  });
});

describe('Function-Redis-Question getQuestionRedis', () => {
  test('Test question is found in redis', async () => {
    const redis = new Redis();
    jest.spyOn(redis, 'get');
    await redis.set(`collab-qns-${key}`, JSON.stringify(question));
    const result = await getQuestionRedis(key, redis);
    expect(result).toBe(JSON.stringify(question));
  });
});
