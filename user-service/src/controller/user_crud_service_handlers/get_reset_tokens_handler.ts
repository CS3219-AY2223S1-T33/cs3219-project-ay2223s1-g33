import { GetResetTokensRequest, GetResetTokensResponse } from '../../proto/user-crud-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IResetTokenStore, IStorage } from '../../storage/storage';
import StoredResetToken from '../../model/reset_token_model';
import { convertStoredResetTokenToResetToken } from '../../model/reset_token_helper';
import { PasswordResetToken } from '../../proto/types';

function getHeaderlessResponse(resp: GetResetTokensResponse): ApiResponse<GetResetTokensResponse> {
  return {
    response: resp,
    headers: {},
  };
}

function buildErrorResponse(errorMessage: string): ApiResponse<GetResetTokensResponse> {
  return getHeaderlessResponse({
    errorMessage,
    tokens: [],
  });
}

class GetResetTokensHandler implements IApiHandler<GetResetTokensRequest, GetResetTokensResponse> {
  resetTokenStore: IResetTokenStore;

  constructor(storage: IStorage) {
    this.resetTokenStore = storage.getResetTokenStore();
  }

  async handle(request: ApiRequest<GetResetTokensRequest>):
  Promise<ApiResponse<GetResetTokensResponse>> {
    const requestObject = request.request;

    const hasToken = requestObject.tokenString && requestObject.tokenString.length > 0;
    const hasUsername = requestObject.username && requestObject.username.length > 0;

    if ((!hasToken && !hasUsername) || (hasToken && hasUsername)) {
      return buildErrorResponse('Malformed request');
    }

    let storedTokens: StoredResetToken[] = [];
    try {
      if (hasUsername) {
        storedTokens = await this.resetTokenStore.getTokensByUsername(requestObject.username);
      } else if (hasToken) {
        const token = await this.resetTokenStore.getToken(requestObject.tokenString);
        if (token) {
          storedTokens.push(token);
        }
      }
    } catch {
      return buildErrorResponse('Database Error');
    }

    const tokens = storedTokens.map((token) => convertStoredResetTokenToResetToken(token))
      .filter((x) => x !== undefined)
      .map((token) => token as PasswordResetToken);

    return getHeaderlessResponse({
      tokens,
      errorMessage: '',
    });
  }
}

export default GetResetTokensHandler;
