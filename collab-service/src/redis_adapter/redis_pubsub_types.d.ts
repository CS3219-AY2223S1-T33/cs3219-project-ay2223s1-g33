declare interface TunnelPubSub<T, V> {
  registerEvent(
    call: (res: V) => void,
  ): Promise<void>;

  push(request: T): Promise<void>;

  clean(
    call: () => void,
  ): Promise<void>;
}

export default TunnelPubSub;
