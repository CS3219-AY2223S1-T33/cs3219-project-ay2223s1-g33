import { UserEntity } from '../db';

declare type StoredResetToken = {
  user: UserEntity;
  token: string;
  expiresAt: Date;
};

export default StoredResetToken;
