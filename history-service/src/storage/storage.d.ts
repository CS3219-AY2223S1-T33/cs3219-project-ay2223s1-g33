import { StoredAttempt } from '../model/attempt_store_model';

declare interface IStorage {
  getAttemptStore(): IAttemptStore;
}

declare interface IAttemptStore {
  addAttempt(attempt: StoredAttempt): Promise<StoredAttempt>;
  removeAttempt(id: number): Promise<void>;
  getAttempt(id: number): Promise<StoredAttempt | undefined>;
  getAttemptByUserId(
    userId: number,
    limit: number,
    offset: number,
  ): Promise<StoredAttempt[]>;
  getAttemptByUsername(
    username: string,
    limit: number,
    offset: number,
  ): Promise<StoredAttempt[]>;
  getAttemptByUsernameAndQuestionId(
    username: string,
    questionId: number,
    limit: number,
    offset: number,
  ): Promise<StoredAttempt[]>;
}

export { IStorage, IAttemptStore };
