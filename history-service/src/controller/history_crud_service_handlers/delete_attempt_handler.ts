import { DeleteAttemptRequest, DeleteAttemptResponse } from '../../proto/history-crud-service';
import { ApiRequest, ApiResponse, IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IAttemptStore } from '../../storage/storage';

class DeleteAttemptHandler implements IApiHandler<DeleteAttemptRequest, DeleteAttemptResponse> {
  attemptStore: IAttemptStore;

  constructor(storage: IStorage) {
    this.attemptStore = storage.getAttemptStore();
  }

  async handle(apiRequest: ApiRequest<DeleteAttemptRequest>):
  Promise<ApiResponse<DeleteAttemptResponse>> {
    const { request } = apiRequest;

    if (request.attemptId <= 0) {
      return DeleteAttemptHandler.buildHeaderlessResponse({
        errorMessage: 'Malformed request',
      });
    }

    await this.attemptStore.removeAttempt(request.attemptId);

    return DeleteAttemptHandler.buildHeaderlessResponse({
      errorMessage: '',
    });
  }

  static buildHeaderlessResponse(response: DeleteAttemptResponse):
  ApiResponse<DeleteAttemptResponse> {
    return {
      response,
      headers: {},
    };
  }
}

export default DeleteAttemptHandler;
