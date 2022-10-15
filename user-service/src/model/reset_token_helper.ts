import { PasswordResetToken } from '../proto/types';
import StoredResetToken from './reset_token_model';

function convertResetTokenToStoredResetToken(token: PasswordResetToken | undefined):
StoredResetToken | undefined {
  if (!token) {
    return undefined;
  }

  return {
    token: token.token,
    expiresAt: new Date(token.expiresAt * 1000), // Javascript uses milliseconds
    user: {
      userId: token.userId,
      nickname: '',
      username: '',
      password: '',
      isActive: true,
    },
  };
}

function convertStoredResetTokenToResetToken(token: StoredResetToken | undefined):
PasswordResetToken | undefined {
  if (!token) {
    return undefined;
  }

  return {
    token: token.token,
    expiresAt: Math.floor(token.expiresAt.getTime() / 1000),
    userId: token.user.userId,
  };
}

export { convertResetTokenToStoredResetToken, convertStoredResetTokenToResetToken };
