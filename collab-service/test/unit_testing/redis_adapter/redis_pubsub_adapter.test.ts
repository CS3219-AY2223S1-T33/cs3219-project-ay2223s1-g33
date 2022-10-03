import { createRedisPubSubAdapter } from '../../../src/redis_adapter/redis_pubsub_adapter';
import RedisTopicPoolStub from './redis_topic_pool_stub';
import SerializerStub from '../tunneller/tunnel_serializer_stub';

const Redis = require('ioredis-mock');

describe('Class-Redis-PubSub RedisPubSubAdapter', () => {
  let pub = new Redis();
  let pool = new RedisTopicPoolStub();
  const serial = new SerializerStub();
  const name = 'name';
  const room = 'room';
  let adapter = createRedisPubSubAdapter(pub, pool, name, room, serial);
  const listenFn = () => {
  };

  beforeEach(() => {
    pub = new Redis();
    pool = new RedisTopicPoolStub();
    adapter = createRedisPubSubAdapter(pub, pool, name, room, serial);
  });

  test('Test adding a listener', async () => {
    jest.spyOn(pool, 'registerTopic')
      .mockImplementationOnce(() => {
      });
    await adapter.addOnMessageListener(listenFn);
    expect(pool.registerTopic)
      .toBeCalledWith(`pubsub-${room}`, expect.any(Function));
  });

  test('Test pushing a message to a listener', async () => {
    jest.spyOn(pub, 'publish')
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .mockImplementationOnce((args) => {
      });
    const msg = 'msg';
    await adapter.pushMessage(msg);
    expect(pub.publish)
      .toBeCalledWith(`pubsub-${room}`, 'serialize test');
  });

  test('Test cleaning topics', async () => {
    await adapter.addOnMessageListener(listenFn);

    jest.spyOn(pool, 'unregisterTopic')
      .mockImplementationOnce(() => {
      });
    await adapter.clean(listenFn);
    expect(pool.unregisterTopic)
      .toBeCalledWith(`pubsub-${room}`, expect.any(Function));
  });

  test('Test cleaning, no existing topics', async () => {
    jest.spyOn(pool, 'unregisterTopic')
      .mockImplementationOnce(() => {
      });
    await adapter.clean(listenFn);
    expect(pool.unregisterTopic)
      .toBeCalledTimes(0);
  });
});
