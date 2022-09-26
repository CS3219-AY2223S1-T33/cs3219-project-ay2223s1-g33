import { TunnelSerializer } from '../redis_adapter/redis_pubsub_types';

declare type TunnelMessage = {
  sender: string,
  data: Uint8Array,
};

class CollabTunnelSerializer implements TunnelSerializer<TunnelMessage> {
  // eslint-disable-next-line class-methods-use-this
  serialize(data: TunnelMessage): string {
    return JSON.stringify(data);
  }

  // eslint-disable-next-line class-methods-use-this
  deserialize(data: string): (TunnelMessage | undefined) {
    const parsedObject = JSON.parse(data);

    if (!('sender' in parsedObject) || !('data' in parsedObject)) {
      return undefined;
    }

    return {
      sender: parsedObject.sender,
      data: parsedObject.data,
    };
  }
}

export {
  TunnelMessage,
  CollabTunnelSerializer,
};
