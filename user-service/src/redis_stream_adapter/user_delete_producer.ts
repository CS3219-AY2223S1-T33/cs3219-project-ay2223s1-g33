import { RedisClientType } from 'redis';

const STREAMS_KEY = 'stream-delete-user';

class UserDeleteProducer implements IStreamProducer {
  redis: RedisClientType;

  constructor(redis: RedisClientType) {
    this.redis = redis;
  }

  async pushStream(msg: string) {
    await this.redis.xAdd(
      STREAMS_KEY,
      '*',
      { userId: msg },
    );
  }
}

function createUserDeleteProducer(redis: RedisClientType): IStreamProducer {
  return new UserDeleteProducer(redis);
}

export default createUserDeleteProducer;
