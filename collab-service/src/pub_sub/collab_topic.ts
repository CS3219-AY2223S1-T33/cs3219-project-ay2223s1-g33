import { ServerDuplexStreamImpl } from '@grpc/grpc-js/build/src/server-call';
import { Topic } from './tunnel_pubsub_types';
import { TunnelServiceRequest, TunnelServiceResponse } from '../proto/tunnel-service';
import CollabSubscription from './collab_subscription';
import Logger from '../utils/logger';

class CollabTopic implements
  Topic<ServerDuplexStreamImpl<TunnelServiceRequest, TunnelServiceResponse>, TunnelServiceRequest> {
  subscriptions: Map<string, CollabSubscription>;

  constructor() {
    this.subscriptions = new Map();
  }

  createSubscription(
    subscriptionName: string,
    call: ServerDuplexStreamImpl<TunnelServiceRequest, TunnelServiceResponse>,
  ) {
    const subExist = this.subscriptions.has(subscriptionName);
    if (!subExist) {
      if (this.subscriptions.size === 2) {
        // Stop appending subscriber
        throw new Error('Subscription is full');
      }
      this.subscriptions.set(subscriptionName, new CollabSubscription(call));
      Logger.info(`Subscription ${subscriptionName} created.`);
    }
  }

  push(request: TunnelServiceRequest) {
    this.subscriptions.forEach((sub) => {
      sub.push(request);
    });
  }
}

export default CollabTopic;
