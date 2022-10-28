import { ICompletedStore } from './storage';
import { IDatabase } from '../db';
import { StoredCompletion } from '../model/completion_store_model';
import HistoryCompletionEntity from '../db/history_completion_entity';

class CompletionStore implements ICompletedStore {
  private dbConn: IDatabase;

  constructor(dbConn: IDatabase) {
    this.dbConn = dbConn;
  }

  async addCompletion(completionEntity: StoredCompletion): Promise<StoredCompletion> {
    const { userId, questionId } = completionEntity;

    if (userId === undefined || userId <= 0) {
      throw new Error('No User Provided');
    }

    if (questionId === undefined || questionId <= 0) {
      throw new Error('No Question Provided');
    }

    const insertedItem = (
      await this.dbConn
        .getHistoryCompletionRepo()
        .save([completionEntity])
    )[0];

    const deepCopyOfItem: StoredCompletion = {
      ...completionEntity,
    };
    deepCopyOfItem.userId = insertedItem.userId;
    deepCopyOfItem.questionId = insertedItem.questionId;

    return deepCopyOfItem;
  }

  async getCompletion(userId: number, questionId: number): Promise<StoredCompletion | undefined> {
    const selectResult: StoredCompletion | null = await this.dbConn
      .getHistoryCompletionRepo()
      .createQueryBuilder('history_completions')
      .where('history_completions.user_id = :userId', { userId })
      .andWhere('history_completions.questionId = :questionId', { questionId })
      .getOne();

    if (!selectResult) {
      return undefined;
    }

    return {
      ...selectResult,
    };
  }

  async removeCompletion(userId: number, questionId: number): Promise<void> {
    await this.dbConn
      .getDataSource()
      .createQueryBuilder()
      .delete()
      .from(HistoryCompletionEntity)
      .where('userId = :userId', { userId })
      .andWhere('questionId = :questionId', { questionId })
      .execute();
  }
}

export default CompletionStore;
