import { RedisClientType } from 'redis';
import { v4 as uuidv4 } from 'uuid';
import { IAttemptStore } from '../storage/storage';
import createRedisConsumer from './redis_consumer';

const STREAMS_KEY_QUESTION = 'stream-delete-question';
const STREAMS_KEY_USER = 'stream-delete-user';

const CONSUMER_GROUP_QUESTION = 'delete-question-history-service';
const CONSUMER_GROUP_USER = 'delete-user-history-service';

const CONSUMER_NAME = uuidv4();

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
      this.storage.removeAllOfHistoryOwner(Number(userId));
    };
  }

  addListeners() {
    this.questionConsumer.setListener(this.createByQuestionRemover());
    this.userConsumer.setListener(this.createByOwnerRemover());
  }

  run() {
    this.questionConsumer.run();
    this.userConsumer.run();
  }
}

function createHistoryRedisConsumer(
  redis: RedisClientType,
  storage: IAttemptStore,
) {
  return new HistoryRedisConsumer(redis, storage);
}

export default createHistoryRedisConsumer;
