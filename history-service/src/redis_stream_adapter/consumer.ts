import { commandOptions, RedisClientType } from 'redis';
import AppStorage from '../storage/app_storage';

const async = require('async');

async function runRedisStreamConsumer(redis: RedisClientType, appStorage: AppStorage) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const attemptStore = appStorage.getAttemptStore();
  const STREAMS_KEY = 'stream-delete-user';
  async.forever(
    async (next: () => void) => {
      const messages = await redis.xRead(
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
      if (messages) {
        // eslint-disable-next-line no-console
        console.log(messages);
        // Todo remove from attemptStore
      }
      next();
    },
  );
}

export default runRedisStreamConsumer;
