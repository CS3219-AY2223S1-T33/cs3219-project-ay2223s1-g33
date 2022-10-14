import { StoredAttempt } from '../model/attempt_store_model';

declare interface IStorage {
  getAttemptStore(): IAttemptStore;
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
}

export { IStorage, IAttemptStore, AttemptStoreSearchResult };
