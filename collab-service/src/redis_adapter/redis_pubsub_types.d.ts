declare interface TunnelPubSub<T> {
  registerEvent(
    call: Function,
  ): Promise<void>;

  push(request: T): Promise<void>;

  clean(
    call: Function,
  ): Promise<void>;
}

export default TunnelPubSub;
