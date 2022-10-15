import { RedisClientType } from 'redis';

const STREAMS_KEY = 'stream-delete-question';

class QuestionDeleteProducer implements IStreamProducer {
  redis: RedisClientType;

  constructor(redis: RedisClientType) {
    this.redis = redis;
  }

  async pushStream(msg: string) {
    await this.redis.xAdd(
      STREAMS_KEY,
      '*',
      { questionId: msg },
    );
  }
}

function createQuestionDeleteProducer(redis: RedisClientType): IStreamProducer {
  return new QuestionDeleteProducer(redis);
}

export default createQuestionDeleteProducer;
