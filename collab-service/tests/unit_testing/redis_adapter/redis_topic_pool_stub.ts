import { RedisTopicPool } from '../../../src/redis_adapter/redis_topic_pool';

export default class RedisTopicPoolStub implements RedisTopicPool {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  registerTopic(topic: string, listener: (msg: string) => void): void {}

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  unregisterTopic(topic: string, listener: (msg: string) => void): void {}
}
