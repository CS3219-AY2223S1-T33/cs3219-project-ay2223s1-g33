import { TunnelSerializer } from '../redis_adapter/redis_pubsub_types';

declare type TunnelMessage = {
  sender: string,
  data: Uint8Array,
};

declare type TunnelInternalMessage = {
  sender: string,
  data: Array<number>,
};

class CollabTunnelSerializer implements TunnelSerializer<TunnelMessage> {
  // eslint-disable-next-line class-methods-use-this
  serialize(data: TunnelMessage): string {
    const simplifiedStruct: TunnelInternalMessage = {
      sender: data.sender,
      data: Array.from(data.data),
    };
    return JSON.stringify(simplifiedStruct);
  }

  // eslint-disable-next-line class-methods-use-this
  deserialize(data: string): (TunnelMessage | undefined) {
    const parsedObject = JSON.parse(data);

    if (!('sender' in parsedObject) || !('data' in parsedObject)) {
      return undefined;
    }

    return {
      sender: parsedObject.sender,
      data: new Uint8Array(parsedObject.data),
    };
  }
}

export {
  TunnelMessage,
  CollabTunnelSerializer,
};
