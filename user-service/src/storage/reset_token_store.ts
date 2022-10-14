/* eslint class-methods-use-this: 0 */
import { IDatabase } from '../db';
import PasswordResetTokenEntity from '../db/password_reset_token_entity';
import StoredResetToken from '../model/reset_token_model';
import Logger from '../utils/logger';
import { IResetTokenStore } from './storage';

class ResetTokenStore implements IResetTokenStore {
  private dbConn: IDatabase;

  constructor(dbConn: IDatabase) {
    this.dbConn = dbConn;
  }

  async addResetToken(token: StoredResetToken): Promise<boolean> {
    try {
      await this.dbConn
        .getPasswordResetTokenRepo()
        .insert(token);
    } catch (ex) {
      Logger.warn(`${ex}`);
      return false;
    }

    return true;
  }

  async removeResetToken(tokenId: string): Promise<boolean> {
    try {
      await this.dbConn.getPasswordResetTokenRepo()
        .createQueryBuilder()
        .delete()
        .where('token_id = :tokenId', { tokenId })
        .execute();
    } catch (ex) {
      Logger.warn(`${ex}`);
      return false;
    }
    return true;
  }

  async getToken(tokenId: string): Promise<StoredResetToken | null> {
    let token: PasswordResetTokenEntity | null = null;

    try {
      token = await this.dbConn.getPasswordResetTokenRepo()
        .findOne({
          where: {
            id: tokenId,
          },
          relations: ['users'],
        });
    } catch (ex) {
      Logger.warn(`${ex}`);
      return null;
    }

    if (token === null) {
      return null;
    }

    return {
      token: token.id,
      user: token.user,
      expiresAt: token.expiresAt,
    };
  }

  async getTokensByUsername(username: string): Promise<StoredResetToken[]> {
    let tokens: PasswordResetTokenEntity[] | null = null;

    try {
      tokens = await this.dbConn.getPasswordResetTokenRepo()
        .find({
          where: {
            user: {
              username,
            },
          },
          relations: ['users'],
          order: {
            createDateTime: 'ASC',
          },
        });
    } catch (ex) {
      Logger.warn(`${ex}`);
      return [];
    }

    if (tokens === null) {
      return [];
    }

    return tokens.map((token) => ({
      token: token.id,
      user: token.user,
      expiresAt: token.expiresAt,
    }));
  }
}

export default ResetTokenStore;
