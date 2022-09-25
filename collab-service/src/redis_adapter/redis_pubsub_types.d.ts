declare interface TunnelPubSub<T> {
  registerEvent(
    call: (res: T) => void,
  ): Promise<void>;

  push(request: T): Promise<void>;

  clean(
    call: () => void,
  ): Promise<void>;
}

export default TunnelPubSub;
