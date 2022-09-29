import setQuestionRedis from '../../../src/redis_adapter/redis_question_adapter';
import { Question } from '../../../src/proto/types';

const redis = require('redis-mock');

jest.mock('redis-mock');

const
redis.set = jest.fn().mockImplementation(() => {
  console.log('set');
});

describe('Function-Redis-Question setQuestionRedis', () => {
  const pub = redis.createClient();
  it(' Test setQuestionRedis', async () => {
    const question: Question = {
      questionId: 1,
      name: '1',
      difficulty: 1,
      content: '1',
      solution: '1',
    };
    await setQuestionRedis('key', question, pub);
  });
});
