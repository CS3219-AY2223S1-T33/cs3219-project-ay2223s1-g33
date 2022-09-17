import { TunnelPubSub } from './tunnel_pubsub_types';
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
}

export default CollabTunnelPubSub;
