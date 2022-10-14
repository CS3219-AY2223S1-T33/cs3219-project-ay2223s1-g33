import { randomBytes } from 'crypto';
import { ResetPasswordRequest, ResetPasswordResponse, ResetPasswordErrorCode } from '../../proto/user-service';
import {
  IApiHandler,
  ApiRequest,
  ApiResponse,
  ILoopbackServiceChannel,
} from '../../api_server/api_server_types';
import { IEmailSender } from '../../email/email_sender';
import { IUserCrudService } from '../../proto/user-crud-service.grpc-server';
import {
  CreateResetTokenRequest,
  CreateResetTokenResponse,
  DeleteResetTokenRequest,
  DeleteResetTokenResponse,
  GetResetTokensRequest,
  GetResetTokensResponse,
  GetUserRequest,
  GetUserResponse,
} from '../../proto/user-crud-service';
import { User } from '../../proto/types';

const MAX_ACTIVE_TOKENS = 3;

class ResetPasswordHandler implements IApiHandler<ResetPasswordRequest, ResetPasswordResponse> {
  emailClient: IEmailSender;

  rpcClient: ILoopbackServiceChannel<IUserCrudService>;

  constructor(rpcClient: ILoopbackServiceChannel<IUserCrudService>, client: IEmailSender) {
    this.emailClient = client;
    this.rpcClient = rpcClient;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  async handle(request: ApiRequest<ResetPasswordRequest>):
  Promise<ApiResponse<ResetPasswordResponse>> {
    const { username } = request.request;
    const userObject = await this.getUserByUsername(username);
    if (!userObject) {
      return ResetPasswordHandler.buildErrorResponse(
        ResetPasswordErrorCode.RESET_PASSWORD_ERROR_INTERNAL_ERROR,
        'No Such User',
      );
    }

    const isUnderLimit = this.checkAndDeleteOldTokens(username);

    if (!isUnderLimit) {
      return ResetPasswordHandler.buildErrorResponse(
        ResetPasswordErrorCode.RESET_PASSWORD_ERROR_INTERNAL_ERROR,
        'Failed to generate a token',
      );
    }

    const token = ResetPasswordHandler.generateToken();
    const nowUnixSeconds = Math.floor(new Date().getTime() / 1000);
    const expiry = nowUnixSeconds + 60 * 60; // 1 hour

    const isCreateSuccess = this.saveToken(token, userObject.userId, expiry);
    if (!isCreateSuccess) {
      return ResetPasswordHandler.buildErrorResponse(
        ResetPasswordErrorCode.RESET_PASSWORD_ERROR_INTERNAL_ERROR,
        'Failed to generate a token',
      );
    }

    const isEamilSendSuccess = await this.emailClient.sendResetEmail(
      username,
      userObject.nickname,
      token,
    );

    if (!isEamilSendSuccess) {
      return ResetPasswordHandler.buildErrorResponse(
        ResetPasswordErrorCode.RESET_PASSWORD_ERROR_INTERNAL_ERROR,
        'Email Sending Failed',
      );
    }

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

    const queryResponse = await this.rpcClient
      .callRoute<GetResetTokensRequest, GetResetTokensResponse>(
      'getResetTokens',
      crudQueryRequest,
      GetResetTokensResponse,
    );

    if (queryResponse.errorMessage !== '') {
      return false;
    }

    if (queryResponse.tokens.length >= MAX_ACTIVE_TOKENS) {
      const crudDeleteRequest: DeleteResetTokenRequest = {
        tokenString: queryResponse.tokens[0].token,
      };
      const isDelSuccess = await this.rpcClient
        .callRoute<DeleteResetTokenRequest, DeleteResetTokenResponse>(
        'deleteResetToken',
        crudDeleteRequest,
        DeleteResetTokenResponse,
      );

      if (isDelSuccess.errorMessage !== '') {
        return false;
      }
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

    const response = await this.rpcClient
      .callRoute<CreateResetTokenRequest, CreateResetTokenResponse>(
      'createResetToken',
      crudInsertRequest,
      CreateResetTokenResponse,
    );

    return response.errorMessage === '';
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const crudQueryRequest: GetUserRequest = {
      user: User.create({
        username,
      }),
    };

    const queryResponse = await this.rpcClient
      .callRoute<GetUserRequest, GetUserResponse>(
      'getUser',
      crudQueryRequest,
      GetUserResponse,
    );

    if (queryResponse.errorMessage !== '' || !queryResponse.user) {
      return undefined;
    }

    return queryResponse.user.userInfo;
  }

  static generateToken(): string {
    return randomBytes(96).toString('base64');
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

export default ResetPasswordHandler;
