import { RedisClientType } from 'redis';

interface RedisTopicPool {
  registerTopic(topic: string, listener: (msg: string) => void): void;
  unregisterTopic(topic: string, listener: (msg: string) => void): void;
}

class RedisTopicPoolManager implements RedisTopicPool {
  topicListeners: { [topic: string]: ((msg: string) => void)[] };

  // Once a Redis connection enters subscribe mode,
  // it cannot send non subscribe-related commands.
  redisSubClient: RedisClientType;

  constructor(redisSubClient: RedisClientType) {
    this.topicListeners = {};
    this.redisSubClient = redisSubClient;
  }

  async registerTopic(topic: string, listener: (msg: string) => void) {
    if (topic in this.topicListeners) {
      this.topicListeners[topic].push(listener);
    } else {
      this.topicListeners[topic] = [
        listener,
      ];
      await this.subscribeTopic(topic);
    }
  }

  async unregisterTopic(topic: string, listener: (msg: string) => void) {
    if (!(topic in this.topicListeners) || this.topicListeners[topic].length < 1) {
      return;
    }

    const listeners = this.topicListeners[topic];
    const indexOfListener = listeners.indexOf(listener);
    if (indexOfListener < 0) {
      return;
    }

    listeners.splice(indexOfListener, 1);
    if (listeners.length === 0) {
      await this.unsubscribeTopic(topic);
    }
  }

  createMuxHandler(topic: string): (msg: string) => void {
    return (msg: string) => {
      const listeners = this.topicListeners[topic];
      listeners.forEach((listener) => listener(msg));
    };
  }

  async subscribeTopic(topic: string) {
    await this.redisSubClient.subscribe(topic, this.createMuxHandler(topic));
  }

  async unsubscribeTopic(topic: string) {
    await this.redisSubClient.unsubscribe(topic);
  }
}

function createRedisTopicPool(redisSubClient: RedisClientType): RedisTopicPool {
  return new RedisTopicPoolManager(redisSubClient);
}

export {
  createRedisTopicPool,
  RedisTopicPool,
};
