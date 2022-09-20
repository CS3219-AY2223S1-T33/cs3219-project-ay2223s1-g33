declare interface TunnelPubSub<T> {
  createTopic(topic: string): T | undefined;
  clean(data: any);
}

declare interface Topic<T, V> {
  createSubscription(subscriptionName: string, call: T);
  push(request: V, sender: string);
  clean(data: any);
  isEmpty(): boolean;
}

declare interface Subscription<T> {
  push(request: T);
  isHandler(data: any);
}

export {
  TunnelPubSub,
  Topic,
  Subscription,
};
