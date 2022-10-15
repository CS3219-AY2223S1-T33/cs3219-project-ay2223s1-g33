import { commandOptions, RedisClientType } from 'redis';
import Logger from '../utils/logger';
import { IAttemptStore } from '../storage/storage';

const STREAMS_KEY = 'stream-delete-user';

class UserDeleteConsumer implements IStreamConsumer {
  redis: RedisClientType;

  storage: IAttemptStore;

  constructor(redis: RedisClientType, storage: IAttemptStore) {
    this.redis = redis;
    this.storage = storage;
  }

  async runConsumer() {
    Logger.info('Starting Redis stream consumer');
    while (true) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const response = await this.redis.xRead(
          // @ts-ignore
          commandOptions({ isolated: true }),
          {
            key: STREAMS_KEY,
            id: '$',
          },
          {
            COUNT: 1,
            BLOCK: 1000,
          },
        );
        if (response) {
          const id = response[0].messages[0].message.userId;
          this.storage.removeHistoryOwner(Number(id));
        }
      } catch (err) {
        Logger.error('Redis stream consumer failed');
      }
    }
  }
}

function createUserDeleteConsumer(redis: RedisClientType, storage: IAttemptStore): IStreamConsumer {
  return new UserDeleteConsumer(redis, storage);
}

export default createUserDeleteConsumer;
