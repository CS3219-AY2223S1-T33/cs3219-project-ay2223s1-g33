import { ConsumeResetTokenRequest, ConsumeResetTokenResponse, ConsumeResetTokenErrorCode } from '../../proto/user-service';
import {
  IApiHandler,
  ApiRequest,
  ApiResponse,
  ILoopbackServiceChannel,
} from '../../api_server/api_server_types';
import {
  DeleteResetTokenRequest,
  DeleteResetTokenResponse,
  EditUserRequest,
  EditUserResponse,
  GetResetTokensRequest,
  GetResetTokensResponse,
  GetUserRequest,
  GetUserResponse,
} from '../../proto/user-crud-service';
import { IUserCrudService } from '../../proto/user-crud-service.grpc-server';
import { PasswordResetToken, PasswordUser, User } from '../../proto/types';
import IHashAgent from '../../auth/hash_agent_types';
import { IAuthenticationAgent } from '../../auth/authentication_agent_types';

class ConsumeResetTokenHandler
implements IApiHandler<ConsumeResetTokenRequest, ConsumeResetTokenResponse> {
  crudClient: ILoopbackServiceChannel<IUserCrudService>;

  authAgent: IAuthenticationAgent;

  hashAgent: IHashAgent;

  constructor(
    crudClient: ILoopbackServiceChannel<IUserCrudService>,
    authAgent: IAuthenticationAgent,
    hashAgent: IHashAgent,
  ) {
    this.crudClient = crudClient;
    this.authAgent = authAgent;
    this.hashAgent = hashAgent;
  }

  async handle(request: ApiRequest<ConsumeResetTokenRequest>):
  Promise<ApiResponse<ConsumeResetTokenResponse>> {
    const { token, newPassword } = request.request;

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

    const queryResponse = await this.crudClient
      .callRoute<GetResetTokensRequest, GetResetTokensResponse>(
      'getResetTokens',
      crudQueryRequest,
      GetResetTokensResponse,
    );

    if (queryResponse.errorMessage !== '' || queryResponse.tokens.length === 0) {
      return undefined;
    }

    return queryResponse.tokens[0];
  }

  async deleteToken(token: string): Promise<boolean> {
    const deleteRequest: DeleteResetTokenRequest = {
      tokenString: token,
    };

    const queryResponse = await this.crudClient
      .callRoute<DeleteResetTokenRequest, DeleteResetTokenResponse>(
      'deleteResetToken',
      deleteRequest,
      DeleteResetTokenResponse,
    );

    return queryResponse.errorMessage === '';
  }

  async getUser(userId: number): Promise<PasswordUser | undefined> {
    const crudQueryRequest: GetUserRequest = {
      user: User.create({
        userId,
      }),
    };

    const queryResponse = await this.crudClient
      .callRoute<GetUserRequest, GetUserResponse>(
      'getUser',
      crudQueryRequest,
      GetUserResponse,
    );

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

    const updateResponse = await this.crudClient
      .callRoute<EditUserRequest, EditUserResponse>(
      'editUser',
      editUserRequest,
      EditUserResponse,
    );

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
