declare interface TunnelPubSub<T> {
  addOnMessageListener(
    call: (res: T) => void,
  ): Promise<void>;

  pushMessage(request: T): Promise<void>;

  clean(
    call: () => void,
  ): Promise<void>;
}

declare interface TunnelSerializer<T> {
  serialize(data: T): string;
  deserialize(flattenedData: string): (T | undefined);
}

export {
  TunnelPubSub,
  TunnelSerializer,
};
