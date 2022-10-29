import { StoredAttempt } from '../model/attempt_store_model';
import { StoredCompletion } from '../model/completion_store_model';

declare interface IStorage {
  getAttemptStore(): IAttemptStore;
  getCompletionStore(): ICompletionStore;
}

declare type AttemptStoreSearchResult = {
  attempts: StoredAttempt[];
  totalCount: number;
};

declare interface IAttemptStore {
  addAttempt(attempt: StoredAttempt): Promise<StoredAttempt>;
  removeAttempt(id: number): Promise<void>;
  getAttempt(id: number): Promise<StoredAttempt | undefined>;
  getAttemptsByUserId(
    userId: number,
    limit: number,
    offset: number,
    shouldOmitSubmission: boolean,
  ): Promise<AttemptStoreSearchResult>;
  getAttemptsByUserIdAndQuestionId(
    userId: number,
    questionId: number,
    limit: number,
    offset: number,
    shouldOmitSubmission: boolean,
  ): Promise<AttemptStoreSearchResult>;
  removeAllOfHistoryOwner(userId: number): Promise<void>;
  removeHistoryByQuestionId(questionId: number): Promise<void>;
}

declare interface ICompletionStore {
  addCompletion(completionEntity: StoredCompletion): Promise<StoredCompletion>;
  getCompletion(
    userId: number,
    questionId: number,
  ): Promise<StoredCompletion | undefined>;
  removeCompletion(
    userId: number,
    questionId: number,
  ): Promise<void>;
}

export {
  IStorage,
  IAttemptStore,
  AttemptStoreSearchResult,
  ICompletionStore,
};
