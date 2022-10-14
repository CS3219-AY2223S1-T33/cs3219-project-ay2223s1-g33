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
import { PasswordResetToken, User } from '../../proto/types';

class ConsumeResetTokenHandler
implements IApiHandler<ConsumeResetTokenRequest, ConsumeResetTokenResponse> {
  rpcClient: ILoopbackServiceChannel<IUserCrudService>;

  constructor(rpcClient: ILoopbackServiceChannel<IUserCrudService>) {
    this.rpcClient = rpcClient;
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

    const isSuccessful = await this.changeUserPassword(tokenObject.userId, newPassword);
    if (!isSuccessful) {
      return ConsumeResetTokenHandler.buildErrorResponse(
        ConsumeResetTokenErrorCode.CONSUME_RESET_TOKEN_ERROR_INTERNAL_ERROR,
        'Could not save new password',
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

    const queryResponse = await this.rpcClient
      .callRoute<GetResetTokensRequest, GetResetTokensResponse>(
      'getUser',
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

    const queryResponse = await this.rpcClient
      .callRoute<DeleteResetTokenRequest, DeleteResetTokenResponse>(
      'deleteResetToken',
      deleteRequest,
      DeleteResetTokenResponse,
    );

    return queryResponse.errorMessage === '';
  }

  async changeUserPassword(userId: number, newPassword: string): Promise<boolean> {
    const crudQueryRequest: GetUserRequest = {
      user: User.create({
        userId,
      }),
    };

    const queryResponse = await this.rpcClient
      .callRoute<GetUserRequest, GetUserResponse>(
      'getUser',
      crudQueryRequest,
      GetUserResponse,
    );

    if (queryResponse.errorMessage !== '' || !queryResponse.user) {
      return false;
    }

    const userModel = queryResponse.user;
    userModel.password = newPassword;
    const editUserRequest: EditUserRequest = {
      user: userModel,
    };

    const updateResponse = await this.rpcClient
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
