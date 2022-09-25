declare interface TunnelPubSub<T> {
  registerEvent(
    call: any,
  ): Promise<void>;

  push(request: T): Promise<void>;

  clean(
    call: any,
  ): Promise<void>;
}

export default TunnelPubSub;
