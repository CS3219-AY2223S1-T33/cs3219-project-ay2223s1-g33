import { TunnelSerializer } from '../../../src/redis_adapter/redis_pubsub_types';

export default class SerializerStub implements TunnelSerializer<string> {
  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  deserialize(flattenedData: string): string | undefined {
    return 'deserialize test';
  }

  // eslint-disable-next-line class-methods-use-this,@typescript-eslint/no-unused-vars
  serialize(data: string): string {
    return 'serialize test';
  }
}
