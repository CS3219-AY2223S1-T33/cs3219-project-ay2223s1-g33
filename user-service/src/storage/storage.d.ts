import { User } from '../proto/types';

declare interface IStorage {
  getUserStore(): IUserStore;
}

declare interface IUserStore {
  addUser(user: User): User;
  removeUser(id: number): void;
  replaceUser(user: User): void;
  getUser(id: number): (User | undefined);
  getUserByUsername(username: string): (User | undefined);
  getAllUsers(): User[];
}

export {
  IStorage,
  IUserStore,
};
