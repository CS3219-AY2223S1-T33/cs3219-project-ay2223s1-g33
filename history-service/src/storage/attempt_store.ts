/* eslint class-methods-use-this: 0 */
import { IDatabase } from '../db';
import HistoryAttemptEntity from '../db/history_entity';
import { StoredAttempt } from '../model/attempt_store_model';
import { IAttemptStore, AttemptStoreSearchResult } from './storage';

// const returnValues = ['attempt_id', 'create_timestamp', 'update_timestamp'];

class AttemptStore implements IAttemptStore {
  private dbConn: IDatabase;

  constructor(dbConn: IDatabase) {
    this.dbConn = dbConn;
  }

  async addAttempt(attempt: StoredAttempt): Promise<StoredAttempt> {
    const { questionId, language, submission } = attempt;

    if (questionId <= 0) {
      throw new Error('No Question Provided');
    }

    if (language.length === 0) {
      throw new Error('No Language Provided');
    }

    if (submission.length === 0) {
      throw new Error('No Submission Data Provided');
    }

    const insertedItem = (
      await this.dbConn
        .getHistoryRepo()
        .save([attempt])
    )[0];

    const deepCopyOfItem: HistoryAttemptEntity = {
      ...attempt,
    };
    deepCopyOfItem.attemptId = insertedItem.attemptId;
    deepCopyOfItem.createDateTime = insertedItem.createDateTime;
    deepCopyOfItem.updateDateTime = insertedItem.updateDateTime;

    return deepCopyOfItem;
  }

  async removeAttempt(attemptId: number): Promise<void> {
    await this.dbConn
      .getDataSource()
      .createQueryBuilder()
      .delete()
      .from(HistoryAttemptEntity)
      .where('attempt_id = :attemptId', { attemptId })
      .execute();
  }

  async getAttempt(attemptId: number): Promise<StoredAttempt | undefined> {
    const selectResult: StoredAttempt | null = await this.dbConn
      .getHistoryRepo()
      .createQueryBuilder('histories')
      .where('attempt_id = :attemptId', { attemptId })
      .getOne();

    if (!selectResult) {
      return undefined;
    }

    const deepCopyOfItem: StoredAttempt = {
      ...selectResult,
    };
    return deepCopyOfItem;
  }

  async getAttemptByUserId(
    userId: number,
    limit: number,
    offset: number,
  ): Promise<AttemptStoreSearchResult> {
    const selectResultPromise = this.dbConn
      .getHistoryRepo()
      .createQueryBuilder('histories')
      .innerJoinAndSelect('histories.users', 'history_owners')
      .where('history_owners.user_id = :userId', { userId })
      .orderBy('histories.attempt_id')
      .limit(limit)
      .offset(offset)
      .getMany();

    const totalCountPromise = this.dbConn
      .getHistoryRepo()
      .createQueryBuilder('histories')
      .innerJoinAndSelect('histories.users', 'history_owners')
      .where('history_owners.user_id = :userId', { userId })
      .getCount();

    const selectResult = await selectResultPromise;
    const totalCount = await totalCountPromise;

    return {
      attempts: selectResult,
      totalCount,
    };
  }

  async getAttemptByUserIdAndQuestionId(
    userId: number,
    questionId: number,
    limit: number,
    offset: number,
  ): Promise<AttemptStoreSearchResult> {
    const selectResultPromise = this.dbConn
      .getHistoryRepo()
      .createQueryBuilder('histories')
      .innerJoinAndSelect('histories.users', 'history_owners')
      .where('history_owners.user_id = :userId', { userId })
      .andWhere('question_id = :questionId', { questionId })
      .orderBy('histories.attempt_id')
      .limit(limit)
      .offset(offset)
      .getMany();

    const totalCountPromise = this.dbConn
      .getHistoryRepo()
      .createQueryBuilder('histories')
      .innerJoinAndSelect('histories.users', 'history_owners')
      .where('history_owners.user_id = :userId = :userId', { userId })
      .andWhere('question_id = :questionId', { questionId })
      .getCount();

    const selectResult = await selectResultPromise;
    const totalCount = await totalCountPromise;

    return {
      attempts: selectResult,
      totalCount,
    };
  }
}

export default AttemptStore;
