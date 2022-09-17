declare interface TunnelPubSub<T> {
  createTopic(topic: string): T | undefined;
}

declare interface Topic<T, V> {
  createSubscription(subscriptionName: string, call: T);
  push(request: V);
}

declare interface Subscription<T> {
  push(request: T);
}

export {
  TunnelPubSub,
  Topic,
  Subscription,
};
