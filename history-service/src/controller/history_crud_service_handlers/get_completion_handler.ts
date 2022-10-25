import { ApiRequest, ApiResponse, IApiHandler } from '../../api_server/api_server_types';
import { ICompletedStore, IStorage } from '../../storage/storage';
import {
  convertToProtoCompletion,
  StoredCompletion,
} from '../../model/completion_store_model';
import { GetCompletionRequest, GetCompletionResponse } from '../../proto/history-crud-service';

class GetCompletionHandler
implements IApiHandler<GetCompletionRequest, GetCompletionResponse> {
  completedStore: ICompletedStore;

  constructor(storage: IStorage) {
    this.completedStore = storage.getCompletionStore();
  }

  async handle(apiRequest: ApiRequest<GetCompletionRequest>):
  Promise<ApiResponse<GetCompletionResponse>> {
    const { request } = apiRequest;

    if (!request.userId) {
      return GetCompletionHandler.buildErrorResponse('No user ID supplied');
    }

    if (!request.questionId) {
      return GetCompletionHandler.buildErrorResponse('No question ID supplied');
    }

    let completedEntity: StoredCompletion | undefined;
    try {
      completedEntity = await this.completedStore.getCompletion(request.userId, request.questionId);
    } catch (err) {
      return GetCompletionHandler.buildErrorResponse(`${err}`);
    }

    const resultCompletion = convertToProtoCompletion(completedEntity);
    if (!resultCompletion) {
      // No entries found, send errorless
      return GetCompletionHandler.buildErrorResponse('');
    }

    return {
      response: {
        completed: resultCompletion,
        errorMessage: '',
      },
      headers: {},
    };
  }

  static buildErrorResponse(errorMessage: string):
  ApiResponse<GetCompletionResponse> {
    return {
      response: {
        completed: undefined,
        errorMessage,
      },
      headers: {},
    };
  }
}

export default GetCompletionHandler;
