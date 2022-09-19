import { ServerDuplexStreamImpl } from '@grpc/grpc-js/build/src/server-call';
import { Topic } from './collab_tunnel_pubsub_types';
import { CollabTunnelRequest, CollabTunnelResponse } from '../proto/collab-service';
import CollabSubscription from './collab_subscription';
import Logger from '../utils/logger';

const MAX_SUBSCRIBERS = 2;

class CollabTopic implements
  Topic<ServerDuplexStreamImpl<CollabTunnelRequest, CollabTunnelResponse>, CollabTunnelRequest> {
  subscriptions: Map<string, CollabSubscription>;

  constructor() {
    this.subscriptions = new Map();
  }

  createSubscription(
    subscriptionName: string,
    call: ServerDuplexStreamImpl<CollabTunnelRequest, CollabTunnelResponse>,
  ) {
    const subExist = this.subscriptions.has(subscriptionName);
    if (!subExist) {
      if (this.subscriptions.size === MAX_SUBSCRIBERS) {
        // Stop appending subscriber
        throw new Error('Subscription is full');
      }
      this.subscriptions.set(subscriptionName, new CollabSubscription(call));
      Logger.info(`Subscription ${subscriptionName} created.`);
    }
  }

  push(request: CollabTunnelRequest, sender: string) {
    this.subscriptions.forEach((sub, user) => {
      // Only send to recipient
      if (sender !== user) {
        sub.push(request);
      }
    });
  }

  clean(data: any) {
    this.subscriptions.forEach((sub, key) => {
      if (sub.isHandler(data)) {
        Logger.info(`Subscription ${key} removed.`);
        this.subscriptions.delete(key);
      }
    });
  }

  isEmpty(): boolean {
    return this.subscriptions.size === 0;
  }
}

export default CollabTopic;
