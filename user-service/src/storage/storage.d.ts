import StoredResetToken from '../model/reset_token_model';
import StoredUser from '../model/user_store_model';

declare interface IStorage {
  getUserStore(): IUserStore;
  getResetTokenStore(): IResetTokenStore;
}

declare interface IUserStore {
  addUser(user: StoredUser): Promise<StoredUser>;
  removeUser(id: number): Promise<void>;
  replaceUser(user: StoredUser): Promise<void>;
  getUser(id: number): Promise<StoredUser | undefined>;
  getUserByUsername(username: string): Promise<StoredUser | undefined>;
  getAllUsers(): Promise<StoredUser[]>;
}

declare interface IResetTokenStore {
  addResetToken(token: StoredResetToken): Promise<boolean>;
  removeResetToken(tokenId: string): Promise<void>;
  getToken(tokenId: string): Promise<StoredResetToken?>;
  getTokensByUsername(username: string): Promise<StoredResetToken[]>;
}

export { IStorage, IUserStore, IResetTokenStore };
