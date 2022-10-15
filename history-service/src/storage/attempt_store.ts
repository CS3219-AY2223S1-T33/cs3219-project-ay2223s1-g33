/* eslint class-methods-use-this: 0 */
import { IDatabase } from '../db';
import HistoryAttemptEntity from '../db/history_entity';
import { StoredAttempt } from '../model/attempt_store_model';
import { IAttemptStore, AttemptStoreSearchResult } from './storage';
import HistoryOwnerEntity from '../db/history_owner_entity';

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

    if (!submission || submission.length === 0) {
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
      .innerJoinAndSelect('histories.users', 'history_owners')
      .addSelect('histories.submission')
      .where('histories.attempt_id = :attemptId', { attemptId })
      .getOne();

    if (!selectResult) {
      return undefined;
    }

    const deepCopyOfItem: StoredAttempt = {
      ...selectResult,
    };
    return deepCopyOfItem;
  }

  async getAttemptsByUserId(
    userId: number,
    limit: number,
    offset: number,
    shouldOmitSubmission: boolean,
  ): Promise<AttemptStoreSearchResult> {
    let selectQuery = this.dbConn
      .getHistoryRepo()
      .createQueryBuilder('histories')
      .innerJoinAndSelect('histories.users', 'history_owners')
      .where('history_owners.user_id = :userId', { userId })
      .orderBy('histories.attempt_id')
      .limit(limit)
      .offset(offset);

    if (!shouldOmitSubmission) {
      selectQuery = selectQuery.addSelect('histories.submission');
    }

    const selectResultPromise = selectQuery.getMany();
    const totalCountPromise = this.dbConn
      .getHistoryRepo()
      .createQueryBuilder('histories')
      .innerJoin('histories.users', 'history_owners')
      .where('history_owners.user_id = :userId', { userId })
      .getCount();

    const selectResult = await selectResultPromise;
    const totalCount = await totalCountPromise;

    return {
      attempts: selectResult,
      totalCount,
    };
  }

  async getAttemptsByUserIdAndQuestionId(
    userId: number,
    questionId: number,
    limit: number,
    offset: number,
    shouldOmitSubmission: boolean,
  ): Promise<AttemptStoreSearchResult> {
    let selectQuery = this.dbConn
      .getHistoryRepo()
      .createQueryBuilder('histories')
      .innerJoinAndSelect('histories.users', 'history_owners')
      .where('history_owners.user_id = :userId', { userId })
      .andWhere('question_id = :questionId', { questionId })
      .orderBy('histories.attempt_id')
      .limit(limit)
      .offset(offset);

    if (!shouldOmitSubmission) {
      selectQuery = selectQuery.addSelect('histories.submission');
    }

    const selectResultPromise = selectQuery.getMany();
    const totalCountPromise = this.dbConn
      .getHistoryRepo()
      .createQueryBuilder('histories')
      .innerJoinAndSelect('histories.users', 'history_owners')
      .where('history_owners.user_id = :userId', { userId })
      .andWhere('question_id = :questionId', { questionId })
      .getCount();

    const selectResult = await selectResultPromise;
    const totalCount = await totalCountPromise;

    return {
      attempts: selectResult,
      totalCount,
    };
  }

  async removeHistoryOwner(userId: number): Promise<void> {
    // Delete HistoryOwner and retrieve attempts
    const returnAttemptId = 'attempt_id';
    // eslint-disable-next-line no-console
    console.log(`Removing owner ${userId} ...`);
    const userAttemptIds: string[] = (await this.dbConn
      .getDataSource()
      .createQueryBuilder()
      .delete()
      .from(HistoryOwnerEntity)
      .where('user_id = :userId', { userId })
      .returning(returnAttemptId)
      .execute()
    ).raw[0];
    // eslint-disable-next-line no-console
    console.log(userAttemptIds);

    const attempts: HistoryAttemptEntity[] = await this.dbConn
      .getHistoryRepo()
      .createQueryBuilder('histories')
      .innerJoinAndSelect('histories.users', 'history_owners')
      .where('histories.attempt_id IN (:...userAttemptIds)', { userAttemptIds })
      .getRawMany<HistoryAttemptEntity>();
    // eslint-disable-next-line no-console
    console.log(attempts);

    attempts.forEach((attempt) => {
      // No users remaining, delete HistoryAttempt
      if (attempt.users === undefined || attempt.users.length === 0) {
        // eslint-disable-next-line no-console
        console.log(`Removing attempt ${attempt.attemptId} ...`);
        this.removeAttempt(attempt.attemptId);
      }
    });
  }
}

export default AttemptStore;
