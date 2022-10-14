import { CreateResetTokenRequest, CreateResetTokenResponse } from '../../proto/user-crud-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IResetTokenStore, IStorage } from '../../storage/storage';
import {
  convertResetTokenToStoredResetToken,
} from '../../model/reset_token_helper';

function getHeaderlessResponse(resp: CreateResetTokenResponse):
ApiResponse<CreateResetTokenResponse> {
  return {
    response: resp,
    headers: {},
  };
}

function buildErrorResponse(errorMessage: string):
ApiResponse<CreateResetTokenResponse> {
  return getHeaderlessResponse({
    errorMessage,
    token: undefined,
  });
}

class CreateResetTokenHandler
implements IApiHandler<CreateResetTokenRequest, CreateResetTokenResponse> {
  resetTokenStore: IResetTokenStore;

  constructor(storage: IStorage) {
    this.resetTokenStore = storage.getResetTokenStore();
  }

  async handle(request: ApiRequest<CreateResetTokenRequest>):
  Promise<ApiResponse<CreateResetTokenResponse>> {
    const requestObject = request.request;
    if (!requestObject.token
      || !requestObject.token.token
      || !requestObject.token.userId
      || !requestObject.token.expiresAt
    ) {
      return buildErrorResponse('Invalid token information');
    }

    const { token } = requestObject;
    const tokenModel = convertResetTokenToStoredResetToken(token);
    if (!tokenModel) {
      return buildErrorResponse('Invalid token information');
    }

    if (token.token.length === 0
      || token.userId <= 0
      || token.expiresAt <= 0) {
      return buildErrorResponse('Invalid token information');
    }

    try {
      await this.resetTokenStore.addResetToken(tokenModel);
    } catch (err) {
      return buildErrorResponse(`${err}`);
    }

    return getHeaderlessResponse({
      token,
      errorMessage: '',
    });
  }
}

export default CreateResetTokenHandler;
