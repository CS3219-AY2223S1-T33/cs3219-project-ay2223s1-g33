import { StoredUser } from '../model/user_store_model';

declare interface IStorage {
  getUserStore(): IUserStore;
}

declare interface IUserStore {
  addUser(user: StoredUser): StoredUser;
  removeUser(id: number): void;
  replaceUser(user: StoredUser): void;
  getUser(id: number): (StoredUser | undefined);
  getUserByUsername(username: string): (StoredUser | undefined);
  getAllUsers(): StoredUser[];
}

export {
  IStorage,
  IUserStore,
};
