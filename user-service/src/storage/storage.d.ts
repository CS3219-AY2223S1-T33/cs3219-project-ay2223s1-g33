import { StoredUser } from '../model/user_store_model';

declare interface IStorage {
  getUserStore(): IUserStore;
}

declare interface IUserStore {
  addUser(user: StoredUser): Promise<StoredUser>;
  removeUser(id: number): Promise<void>;
  replaceUser(user: StoredUser): Promise<void>;
  getUser(id: number): Promise<StoredUser | undefined>;
  getUserByUsername(username: string): Promise<StoredUser | undefined>;
  getAllUsers(): Promise<StoredUser[]>;
}

export { IStorage, IUserStore };
