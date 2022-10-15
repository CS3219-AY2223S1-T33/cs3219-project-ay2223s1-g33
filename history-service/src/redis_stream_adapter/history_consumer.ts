import { commandOptions, RedisClientType } from 'redis';
import AppStorage from '../storage/app_storage';
import Logger from '../utils/logger';
import { IAttemptStore } from '../storage/storage';

const STREAM_KEY = 'stream-delete-user';

class HistoryConsumer implements IStreamConsumer {
  redis: RedisClientType;

  storage: IAttemptStore;

  constructor(redis: RedisClientType, appStorage: AppStorage) {
    this.redis = redis;
    this.storage = appStorage.getAttemptStore();
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
            key: STREAM_KEY,
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

function createHistoryConsumer(redis: RedisClientType, appStorage: AppStorage) {
  return new HistoryConsumer(redis, appStorage);
}

export default createHistoryConsumer;
