import { TunnelPubSub } from './collab_tunnel_pubsub_types';
import Logger from '../utils/logger';
import CollabTopic from './collab_topic';

class CollabTunnelPubSub implements TunnelPubSub<CollabTopic> {
  topics : Map<string, CollabTopic>;

  constructor() {
    this.topics = new Map();
  }

  createTopic(topic: string): CollabTopic | undefined {
    const topicExist = this.topics.has(topic);
    if (!topicExist) {
      const newTopic = new CollabTopic();
      this.topics.set(topic, newTopic);
      Logger.info(`Topic ${topic} created.`);
      return newTopic;
    }
    return this.topics.get(topic);
  }

  clean(data: any) {
    this.topics.forEach((topic, key) => {
      topic.clean(data);
      if (topic.isEmpty()) {
        Logger.info(`Topic ${key} removed.`);
        this.topics.delete(key);
      }
    });
  }
}

export default CollabTunnelPubSub;
