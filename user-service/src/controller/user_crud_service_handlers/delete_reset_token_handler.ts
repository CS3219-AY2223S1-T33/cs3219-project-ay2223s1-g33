import { DeleteResetTokenRequest, DeleteResetTokenResponse } from '../../proto/user-crud-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IResetTokenStore, IStorage } from '../../storage/storage';

function getHeaderlessResponse(resp: DeleteResetTokenResponse):
ApiResponse<DeleteResetTokenResponse> {
  return {
    response: resp,
    headers: {},
  };
}

function buildErrorResponse(errorMessage: string):
ApiResponse<DeleteResetTokenResponse> {
  return getHeaderlessResponse({
    errorMessage,
  });
}

class DeleteResetTokenHandler
implements IApiHandler<DeleteResetTokenRequest, DeleteResetTokenResponse> {
  resetTokenStore: IResetTokenStore;

  constructor(storage: IStorage) {
    this.resetTokenStore = storage.getResetTokenStore();
  }

  async handle(request: ApiRequest<DeleteResetTokenRequest>):
  Promise<ApiResponse<DeleteResetTokenResponse>> {
    const requestObject = request.request;

    if (requestObject.tokenString.length === 0) {
      return buildErrorResponse('Malformed request');
    }

    const isSuccess = await this.resetTokenStore.removeResetToken(requestObject.tokenString);
    if (!isSuccess) {
      return buildErrorResponse('Database Error');
    }

    return getHeaderlessResponse({
      errorMessage: '',
    });
  }
}

export default DeleteResetTokenHandler;
