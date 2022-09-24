declare interface TunnelPubSub<T, V> {
  registerEvent(
    call: ServerDuplexStreamImpl<T, V>,
  ): Promise<void>;

  push(request: T): Promise<void>;

  clean(
    call: ServerDuplexStreamImpl<T, V>,
  ): Promise<void>;
}

export default TunnelPubSub;
