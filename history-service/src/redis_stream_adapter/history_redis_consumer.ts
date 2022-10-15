import { RedisClientType } from 'redis';
import { IAttemptStore } from '../storage/storage';
import createRedisConsumer from './redis_consumer';

const STREAMS_KEY_QUESTION = 'stream-delete-question';
const STREAMS_KEY_USER = 'stream-delete-user';

const CONSUMER_GROUP_QUESTION = 'stream-delete-question-consumer';
const CONSUMER_GROUP_USER = 'stream-delete-user-consumer';

const CONSUMER_NAME_QUESTION = 'stream-consumer-question-service';
const CONSUMER_NAME_USER = 'stream-consumer-question-service';

class HistoryRedisConsumer {
  questionConsumer: IStreamConsumer;

  userConsumer: IStreamConsumer;

  storage: IAttemptStore;

  constructor(
    redis: RedisClientType,
    storage: IAttemptStore,
  ) {
    this.questionConsumer = createRedisConsumer(
      redis,
      STREAMS_KEY_QUESTION,
      CONSUMER_GROUP_QUESTION,
      CONSUMER_NAME_QUESTION,
    );
    this.userConsumer = createRedisConsumer(
      redis,
      STREAMS_KEY_USER,
      CONSUMER_GROUP_USER,
      CONSUMER_NAME_USER,
    );
    this.storage = storage;
  }

  createByQuestionRemover() {
    return (response: { [property: string]: string }) => {
      const { questionId } = response;
      this.storage.removeHistoryByQuestionId(Number(questionId));
    };
  }

  createByOwnerRemover() {
    return (response: { [property: string]: string }) => {
      const { userId } = response;
      this.storage.removeHistoryOwner(Number(userId));
    };
  }

  run() {
    this.questionConsumer.runConsumer(this.createByQuestionRemover());
    this.userConsumer.runConsumer(this.createByOwnerRemover());
  }
}

function createHistoryRedisConsumer(
  redis: RedisClientType,
  storage: IAttemptStore,
) {
  return new HistoryRedisConsumer(redis, storage);
}

export default createHistoryRedisConsumer;
