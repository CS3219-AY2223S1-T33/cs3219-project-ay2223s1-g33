import { GetAttemptRequest, GetAttemptResponse } from '../../proto/history-crud-service';
import { ApiRequest, ApiResponse, IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IAttemptStore } from '../../storage/storage';
import { convertToProtoAttempt } from '../../model/attempt_store_model';

class GetAttemptHandler implements IApiHandler<GetAttemptRequest, GetAttemptResponse> {
  attemptStore: IAttemptStore;

  constructor(storage: IStorage) {
    this.attemptStore = storage.getAttemptStore();
  }

  async handle(apiRequest: ApiRequest<GetAttemptRequest>):
  Promise<ApiResponse<GetAttemptResponse>> {
    const { request } = apiRequest;
    if (!request.attemptId) {
      return GetAttemptHandler.buildErrorResponse('No attempt ID supplied');
    }

    const attemptObject = await this.attemptStore.getAttempt(request.attemptId);
    if (!attemptObject) {
      return GetAttemptHandler.buildErrorResponse('No such attempt found');
    }

    const resultObject = convertToProtoAttempt(attemptObject);
    if (!resultObject) {
      return GetAttemptHandler.buildErrorResponse('An internal error occurred');
    }

    return {
      headers: {},
      response: {
        attempt: resultObject,
        errorMessage: '',
      },
    };
  }

  static buildErrorResponse(errorMessage: string): ApiResponse<GetAttemptResponse> {
    return {
      response: {
        errorMessage,
        attempt: undefined,
      },
      headers: {},
    };
  }
}

export default GetAttemptHandler;
