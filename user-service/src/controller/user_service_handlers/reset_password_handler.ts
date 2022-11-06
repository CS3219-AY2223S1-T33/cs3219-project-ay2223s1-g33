import Validator from 'validator';
import { randomBytes } from 'crypto';
import { ResetPasswordRequest, ResetPasswordResponse, ResetPasswordErrorCode } from '../../proto/user-service';
import {
  IApiHandler,
  ApiRequest,
  ApiResponse,
} from '../../api_server/api_server_types';
import { IEmailSender } from '../../email/email_sender';
import { IUserCrudService } from '../../proto/user-crud-service.grpc-server';
import {
  CreateResetTokenRequest,
  DeleteResetTokenRequest,
  GetResetTokensRequest,
  GetUserRequest,
} from '../../proto/user-crud-service';
import { User } from '../../proto/types';
import Logger from '../../utils/logger';
import { ILoopbackServiceChannel } from '../../api_server/loopback_server_types';

const MAX_ACTIVE_TOKENS = 3;

class ResetPasswordHandler implements IApiHandler<ResetPasswordRequest, ResetPasswordResponse> {
  emailClient: IEmailSender;

  rpcLoopback: ILoopbackServiceChannel<IUserCrudService>;

  constructor(rpcLoopback: ILoopbackServiceChannel<IUserCrudService>, client: IEmailSender) {
    this.emailClient = client;
    this.rpcLoopback = rpcLoopback;
  }

  async handle(request: ApiRequest<ResetPasswordRequest>):
  Promise<ApiResponse<ResetPasswordResponse>> {
    const validatedRequest = ResetPasswordHandler.validateRequest(request.request.username);
    if (validatedRequest instanceof Error) {
      return ResetPasswordHandler.buildErrorResponse(
        ResetPasswordErrorCode.RESET_PASSWORD_ERROR_BAD_REQUEST,
        validatedRequest.message,
      );
    }

    const { username } = validatedRequest;
    const userObject = await this.getUserByUsername(username);
    if (!userObject) {
      return ResetPasswordHandler.buildErrorResponse(
        ResetPasswordErrorCode.RESET_PASSWORD_ERROR_BAD_REQUEST,
        'No Such User',
      );
    }

    const isUnderLimit = await this.checkAndDeleteOldTokens(username);

    if (!isUnderLimit) {
      return ResetPasswordHandler.buildErrorResponse(
        ResetPasswordErrorCode.RESET_PASSWORD_ERROR_INTERNAL_ERROR,
        'Failed to generate a token',
      );
    }

    const token = ResetPasswordHandler.generateToken();
    const nowUnixSeconds = Math.floor(new Date().getTime() / 1000);
    const expiry = nowUnixSeconds + 60 * 60; // 1 hour

    const isCreateSuccess = await this.saveToken(token, userObject.userId, expiry);
    if (!isCreateSuccess) {
      return ResetPasswordHandler.buildErrorResponse(
        ResetPasswordErrorCode.RESET_PASSWORD_ERROR_INTERNAL_ERROR,
        'Failed to generate a token',
      );
    }

    this.emailClient.sendResetEmail(
      username,
      userObject.nickname,
      token,
    )
      .then(() => Logger.info(`Reset Email Sent: ${username}`))
      .catch((err) => Logger.warn(`Failed to send reset email: ${err}`));

    return {
      response: ResetPasswordResponse.create(),
      headers: {},
    };
  }

  async checkAndDeleteOldTokens(username: string): Promise<boolean> {
    const crudQueryRequest: GetResetTokensRequest = {
      username,
      tokenString: '',
    };

    try {
      const queryResponse = await this.rpcLoopback
        .client
        .getResetTokens(crudQueryRequest);

      if (queryResponse.errorMessage !== '') {
        return false;
      }

      if (queryResponse.tokens.length >= MAX_ACTIVE_TOKENS) {
        const crudDeleteRequest: DeleteResetTokenRequest = {
          tokenString: queryResponse.tokens[0].token,
        };
        const isDelSuccess = await this.rpcLoopback.client
          .deleteResetToken(crudDeleteRequest);

        if (isDelSuccess.errorMessage !== '') {
          return false;
        }
      }
    } catch {
      return false;
    }

    return true;
  }

  async saveToken(token: string, userId: number, expiresAt: number): Promise<boolean> {
    const crudInsertRequest: CreateResetTokenRequest = {
      token: {
        token,
        userId,
        expiresAt,
      },
    };

    try {
      const response = await this.rpcLoopback.client
        .createResetToken(crudInsertRequest);

      return response.errorMessage === '';
    } catch {
      return false;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const crudQueryRequest: GetUserRequest = {
      user: User.create({
        username,
      }),
    };

    try {
      const queryResponse = await this.rpcLoopback.client
        .getUser(crudQueryRequest);

      if (queryResponse.errorMessage !== '' || !queryResponse.user) {
        return undefined;
      }

      return queryResponse.user.userInfo;
    } catch {
      return undefined;
    }
  }

  static validateRequest(username: string): (ValidatedRequest | Error) {
    if (Validator.isEmpty(username)) {
      return new Error('Empty username provided');
    }

    if (!Validator.isEmail(username)) {
      return new Error('Username must be a valid email');
    }

    const sanitizedEmail = Validator.normalizeEmail(username);
    if (!sanitizedEmail) {
      return new Error('Username must be a valid email');
    }

    return {
      username: sanitizedEmail,
    };
  }

  static generateToken(): string {
    return randomBytes(96).toString('hex');
  }

  static buildErrorResponse(errorCode: ResetPasswordErrorCode, errorMessage: string)
    : ApiResponse<ResetPasswordResponse> {
    return {
      response: {
        errorCode,
        errorMessage,
      },
      headers: {},
    };
  }
}

type ValidatedRequest = {
  username: string,
};

export default ResetPasswordHandler;
