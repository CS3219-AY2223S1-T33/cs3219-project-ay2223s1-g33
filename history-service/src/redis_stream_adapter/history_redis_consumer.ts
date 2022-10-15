import { RedisClientType } from 'redis';
import { IAttemptStore } from '../storage/storage';
import createRedisConsumer from './redis_consumer';

const uuid = require('uuid');

const STREAMS_KEY_QUESTION = 'stream-delete-question';
const STREAMS_KEY_USER = 'stream-delete-user';

const CONSUMER_GROUP_QUESTION = 'delete-question-history-service';
const CONSUMER_GROUP_USER = 'delete-user-history-service';

const CONSUMER_NAME = uuid.v4();

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
      CONSUMER_NAME,
    );
    this.userConsumer = createRedisConsumer(
      redis,
      STREAMS_KEY_USER,
      CONSUMER_GROUP_USER,
      CONSUMER_NAME,
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
