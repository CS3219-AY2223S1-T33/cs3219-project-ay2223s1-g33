import { ConsumeResetTokenRequest, ConsumeResetTokenResponse, ConsumeResetTokenErrorCode } from '../../proto/user-service';
import {
  IApiHandler,
  ApiRequest,
  ApiResponse,
} from '../../api_server/api_server_types';
import {
  DeleteResetTokenRequest,
  EditUserRequest,
  GetResetTokensRequest,
  GetUserRequest,
} from '../../proto/user-crud-service';
import { IUserCrudService } from '../../proto/user-crud-service.grpc-server';
import { PasswordResetToken, PasswordUser, User } from '../../proto/types';
import IHashAgent from '../../auth/hash_agent_types';
import { IAuthenticationAgent } from '../../auth/authentication_agent_types';
import { ILoopbackServiceChannel } from '../../api_server/loopback_server_types';

class ConsumeResetTokenHandler
implements IApiHandler<ConsumeResetTokenRequest, ConsumeResetTokenResponse> {
  crudLoopback: ILoopbackServiceChannel<IUserCrudService>;

  authAgent: IAuthenticationAgent;

  hashAgent: IHashAgent;

  constructor(
    crudLoopback: ILoopbackServiceChannel<IUserCrudService>,
    authAgent: IAuthenticationAgent,
    hashAgent: IHashAgent,
  ) {
    this.crudLoopback = crudLoopback;
    this.authAgent = authAgent;
    this.hashAgent = hashAgent;
  }

  async handle(request: ApiRequest<ConsumeResetTokenRequest>):
  Promise<ApiResponse<ConsumeResetTokenResponse>> {
    const { token, newPassword } = request.request;

    if (token.length === 0 || newPassword.length === 0) {
      return ConsumeResetTokenHandler.buildErrorResponse(
        ConsumeResetTokenErrorCode.CONSUME_RESET_TOKEN_ERROR_BAD_REQUEST,
        'Bad Request',
      );
    }

    const tokenObject = await this.getTokenData(token);
    if (!tokenObject) {
      return ConsumeResetTokenHandler.buildErrorResponse(
        ConsumeResetTokenErrorCode.CONSUME_RESET_TOKEN_ERROR_BAD_REQUEST,
        'Bad Token',
      );
    }

    const unixMillisNow = Math.floor(new Date().getTime() / 1000);
    if (tokenObject.expiresAt < unixMillisNow) {
      return ConsumeResetTokenHandler.buildErrorResponse(
        ConsumeResetTokenErrorCode.CONSUME_RESET_TOKEN_ERROR_BAD_REQUEST,
        'Token has expired',
      );
    }

    const isDeleteSuccess = await this.deleteToken(token);
    if (!isDeleteSuccess) {
      return ConsumeResetTokenHandler.buildErrorResponse(
        ConsumeResetTokenErrorCode.CONSUME_RESET_TOKEN_ERROR_INTERNAL_ERROR,
        'Failed to consume token',
      );
    }

    const hashedPassword = await this.hashAgent.hashPassword(newPassword);
    const user = await this.getUser(tokenObject.userId);
    if (!user || !user.userInfo) {
      return ConsumeResetTokenHandler.buildErrorResponse(
        ConsumeResetTokenErrorCode.CONSUME_RESET_TOKEN_ERROR_INTERNAL_ERROR,
        'Could not find user',
      );
    }

    const isSuccessful = await this.changeUserPassword(user, hashedPassword);
    if (!isSuccessful) {
      return ConsumeResetTokenHandler.buildErrorResponse(
        ConsumeResetTokenErrorCode.CONSUME_RESET_TOKEN_ERROR_INTERNAL_ERROR,
        'Could not save new password',
      );
    }

    try {
      await this.authAgent.invalidateTokensBeforeTime(
        user.userInfo.username,
        Math.floor(new Date().getTime() / 1000),
      );
    } catch {
      return ConsumeResetTokenHandler.buildErrorResponse(
        ConsumeResetTokenErrorCode.CONSUME_RESET_TOKEN_ERROR_INTERNAL_ERROR,
        'Could not invalidate old tokens',
      );
    }

    return ConsumeResetTokenHandler.buildHeaderlessResponse({
      errorCode: ConsumeResetTokenErrorCode.CONSUME_RESET_TOKEN_ERROR_NONE,
      errorMessage: '',
    });
  }

  async getTokenData(token: string): Promise<PasswordResetToken | undefined> {
    const crudQueryRequest: GetResetTokensRequest = {
      username: '',
      tokenString: token,
    };

    const queryResponse = await this.crudLoopback.client
      .getResetTokens(crudQueryRequest);

    if (queryResponse.errorMessage !== '' || queryResponse.tokens.length === 0) {
      return undefined;
    }

    return queryResponse.tokens[0];
  }

  async deleteToken(token: string): Promise<boolean> {
    const deleteRequest: DeleteResetTokenRequest = {
      tokenString: token,
    };

    const queryResponse = await this.crudLoopback.client.deleteResetToken(deleteRequest);
    return queryResponse.errorMessage === '';
  }

  async getUser(userId: number): Promise<PasswordUser | undefined> {
    const crudQueryRequest: GetUserRequest = {
      user: User.create({
        userId,
      }),
    };

    const queryResponse = await this.crudLoopback.client.getUser(crudQueryRequest);
    if (queryResponse.errorMessage !== '' || !queryResponse.user) {
      return undefined;
    }

    return queryResponse.user;
  }

  async changeUserPassword(userModel: PasswordUser, newPassword: string): Promise<boolean> {
    const newUserModel = userModel;
    newUserModel.password = newPassword;
    const editUserRequest: EditUserRequest = {
      user: newUserModel,
    };

    const updateResponse = await this.crudLoopback.client.editUser(editUserRequest);
    return updateResponse.errorMessage === '';
  }

  static buildHeaderlessResponse(response: ConsumeResetTokenResponse):
  ApiResponse<ConsumeResetTokenResponse> {
    return {
      response,
      headers: {},
    };
  }

  static buildErrorResponse(errorCode: ConsumeResetTokenErrorCode, errorMessage: string)
    : ApiResponse<ConsumeResetTokenResponse> {
    return ConsumeResetTokenHandler.buildHeaderlessResponse({
      errorCode,
      errorMessage,
    });
  }
}

export default ConsumeResetTokenHandler;
