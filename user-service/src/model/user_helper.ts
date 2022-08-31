import { PasswordUser } from '../proto/types';
import { StoredUser } from './user_store_model';

function convertPasswordUserToStoredUser(user: PasswordUser | undefined): (StoredUser | undefined) {
  if (!user) {
    return undefined;
  }

  if (!user.userInfo) {
    return undefined;
  }

  return {
    userId: user.userInfo.userId,
    username: user.userInfo.username,
    nickname: user.userInfo.nickname,
    password: user.password,
  };
}

function convertStoredUserToPasswordUser(user: StoredUser | undefined): (PasswordUser | undefined) {
  if (!user) {
    return undefined;
  }

  return {
    userInfo: {
      userId: user.userId,
      username: user.username,
      nickname: user.nickname,
    },
    password: user.password,
  };
}

export {
  convertPasswordUserToStoredUser,
  convertStoredUserToPasswordUser,
};
