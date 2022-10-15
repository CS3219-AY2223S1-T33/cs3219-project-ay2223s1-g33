import { commandOptions, RedisClientType } from 'redis';
import AppStorage from '../storage/app_storage';

async function runRedisStreamConsumer(redis: RedisClientType, appStorage: AppStorage) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const attemptStore = appStorage.getAttemptStore();
  const STREAMS_KEY = 'stream-delete-user';

  while (true) {
    try {
      // eslint-disable-next-line no-await-in-loop
      const response = await redis.xRead(
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
        attemptStore.removeHistoryOwner(Number(id));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  }
}

export default runRedisStreamConsumer;
