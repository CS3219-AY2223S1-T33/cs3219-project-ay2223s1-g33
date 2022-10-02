import { createRedisTopicPool } from '../../../src/redis_adapter/redis_topic_pool';

const Redis = require('ioredis-mock');

describe('Class-RedisTopicPool RedisTopicPoolManager', () => {
  const redis = new Redis();
  const redisPool = createRedisTopicPool(redis);

  jest.spyOn(redis, 'subscribe')
    .mockImplementationOnce(() => {});
  jest.spyOn(redis, 'unsubscribe')
    .mockImplementationOnce(() => {});

  const key = 'key';
  const listenFn = () => {};

  test('Test registration of topic, subscribes to redis', async () => {
    await redisPool.registerTopic(key, listenFn);
    expect(redis.subscribe)
      .toBeCalledWith('key', expect.any(Function));
  });
  test('Test unregister existing subscriber, unsubscribes from redis', async () => {
    await redisPool.registerTopic(key, listenFn);
    await redisPool.unregisterTopic(key, listenFn);
    expect(redis.unsubscribe)
      .toBeCalledWith('key');
  });
  test('Test unregister non-existing subscriber, nothing happens', async () => {
    await redisPool.unregisterTopic(key, listenFn);
    expect(redis.unsubscribe)
      .toHaveBeenCalledTimes(0);
  });
});
