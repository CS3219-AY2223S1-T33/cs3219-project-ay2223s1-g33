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
  getAttemptByUserId(
    userId: number,
    limit: number,
    offset: number,
  ): Promise<AttemptStoreSearchResult>;
  getAttemptByUsername(
    username: string,
    limit: number,
    offset: number,
  ): Promise<AttemptStoreSearchResult>;
  getAttemptByUsernameAndQuestionId(
    username: string,
    questionId: number,
    limit: number,
    offset: number,
  ): Promise<AttemptStoreSearchResult>;
}

export { IStorage, IAttemptStore, AttemptStoreSearchResult };
