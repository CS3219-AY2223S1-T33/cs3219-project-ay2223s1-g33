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
    const resultAttemptId: { attempt_id: number; }[] = (await this.dbConn
      .getDataSource()
      .createQueryBuilder()
      .delete()
      .from(HistoryOwnerEntity)
      .where('user_id = :userId', { userId })
      .returning('attempt_id')
      .execute()
    ).raw;
    if (!resultAttemptId) {
      return;
    }
    const deletedUserAttempts = resultAttemptId.map(
      (res: { attempt_id: number; }) => res.attempt_id,
    );
    if (!deletedUserAttempts.length) {
      return;
    }

    // Retrieve deleted owner's attempts that has other owners
    const otherUserAttempts: HistoryAttemptEntity[] = await this.dbConn
      .getHistoryRepo()
      .createQueryBuilder('histories')
      .innerJoinAndSelect('histories.users', 'history_owners')
      .where('histories.attempt_id IN (:...listOfIds)', { listOfIds: deletedUserAttempts })
      .getMany();
    const attemptsWithOtherUser = new Set();
    otherUserAttempts.map(
      (res: HistoryAttemptEntity) => attemptsWithOtherUser.add(res.attemptId),
    );

    // Only delete attempts with no owners
    deletedUserAttempts.forEach((attemptId) => {
      if (!attemptsWithOtherUser.has(attemptId)) {
        this.removeAttempt(attemptId);
      }
    });
  }

  async removeHistoryByQuestionId(questionId: number): Promise<void> {
    // Remove attempts of question id, DB cascades deletes owners
    await this.dbConn
      .getDataSource()
      .createQueryBuilder()
      .delete()
      .from(HistoryAttemptEntity)
      .where('question_id = :questionId', { questionId })
      .execute();
  }
}

export default AttemptStore;
