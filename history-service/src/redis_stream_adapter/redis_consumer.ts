import { commandOptions, RedisClientType } from 'redis';
import Logger from '../utils/logger';

class RedisConsumer implements IStreamConsumer {
  redis: RedisClientType;

  streams_key: string;

  consumer_group: string;

  consumer_name: string;

  constructor(
    redis: RedisClientType,
    streams_key: string,
    consumer_group: string,
    consumer_name: string,
  ) {
    this.redis = redis;
    this.streams_key = streams_key;
    this.consumer_group = consumer_group;
    this.consumer_name = consumer_name;
  }

  async runConsumer(call: (response: { [property: string]: string }) => void) {
    try {
      await this.redis.xGroupCreate(this.streams_key, this.consumer_group, '0', {
        MKSTREAM: true,
      });
      Logger.info(`Created ${this.consumer_group} consumer group.`);
    } catch (err) {
      Logger.info(`Consumer ${this.consumer_group} consumer group already exists, skipped creation.`);
    }

    while (true) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const response = await this.redis.xReadGroup(
          // @ts-ignore
          commandOptions({ isolated: true }),
          this.consumer_group,
          this.consumer_name,
          [
            {
              key: this.streams_key,
              id: '>',
            },
          ],
          {
            COUNT: 1,
            BLOCK: 5000,
          },
        );
        if (response) {
          // Execute on response data
          call(response[0].messages[0].message);
          // Acknowledge read data
          const entryId = response[0].messages[0].id;
          this.redis.xAck(this.streams_key, this.consumer_group, entryId);
        }
      } catch (err) {
        Logger.error('Redis Question consumer failed');
      }
    }
  }
}

function createRedisConsumer(
  redis: RedisClientType,
  streams_key: string,
  consumer_group: string,
  consumer_name: string,
)
  : IStreamConsumer {
  return new RedisConsumer(redis, streams_key, consumer_group, consumer_name);
}

export default createRedisConsumer;
