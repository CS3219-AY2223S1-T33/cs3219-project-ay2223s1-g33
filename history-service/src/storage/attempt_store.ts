/* eslint class-methods-use-this: 0 */
import { getDatabase } from '../db';
import HistoryAttemptEntity from '../db/History';
import { StoredAttempt } from '../model/attempt_store_model';
import { IAttemptStore } from './storage';

// const returnValues = ['attempt_id', 'create_timestamp', 'update_timestamp'];

class AttemptStore implements IAttemptStore {
  async addAttempt(attempt: StoredAttempt): Promise<StoredAttempt> {
    const { question, language, submission } = attempt;

    if (question === undefined || question.questionId <= 0) {
      throw new Error('No Question Provided');
    }

    if (language.length === 0) {
      throw new Error('No Language Provided');
    }

    if (submission.length === 0) {
      throw new Error('No Submission Data Provided');
    }

    const insertedItem = (
      await getDatabase()
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
    await getDatabase()
      .getDataSource()
      .createQueryBuilder()
      .delete()
      .from(HistoryAttemptEntity)
      .where('attempt_id = :attemptId', { attemptId })
      .execute();
  }

  async getAttempt(attemptId: number): Promise<StoredAttempt | undefined> {
    const selectResult: StoredAttempt | null = await getDatabase()
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
  ): Promise<StoredAttempt[]> {
    const selectResult: StoredAttempt[] = await getDatabase()
      .getHistoryRepo()
      .createQueryBuilder('histories')
      .innerJoinAndSelect('histories.users', 'users')
      .innerJoinAndSelect('histories.question', 'question')
      .where('users.userId = :userId', { userId })
      .limit(limit)
      .offset(offset)
      .getMany();

    return selectResult;
  }

  async getAttemptByUsername(
    username: string,
    limit: number,
    offset: number,
  ): Promise<StoredAttempt[]> {
    const selectResult: StoredAttempt[] = await getDatabase()
      .getHistoryRepo()
      .createQueryBuilder('histories')
      .innerJoinAndSelect('histories.users', 'users')
      .innerJoinAndSelect('histories.question', 'question')
      .where('users.username = :username', { username })
      .limit(limit)
      .offset(offset)
      .getMany();

    return selectResult;
  }

  async getAttemptByUsernameAndQuestionId(
    username: string,
    questionId: number,
    limit: number,
    offset: number,
  ): Promise<StoredAttempt[]> {
    const selectResult: StoredAttempt[] = await getDatabase()
      .getHistoryRepo()
      .createQueryBuilder('histories')
      .innerJoinAndSelect('histories.users', 'users')
      .innerJoinAndSelect('histories.question', 'question')
      .where('users.username = :username', { username })
      .andWhere('question.questionId = :questionId', { questionId })
      .limit(limit)
      .offset(offset)
      .getMany();

    return selectResult;
  }
}

export default AttemptStore;
