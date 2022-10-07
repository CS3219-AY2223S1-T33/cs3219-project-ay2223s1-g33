import { TunnelSerializer } from '../redis_adapter/redis_pubsub_types';
import { TunnelInternalMessage, TunnelMessage } from '../message_handler/internal/internal_message_types';

export default class CollabTunnelSerializer implements TunnelSerializer<TunnelMessage> {
  // eslint-disable-next-line class-methods-use-this
  serialize(data: TunnelMessage): string {
    const simplifiedStruct: TunnelInternalMessage = {
      sender: data.sender,
      data: Array.from(data.data),
      flag: data.flag,
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
      flag: parsedObject.flag,
    };
  }
}
