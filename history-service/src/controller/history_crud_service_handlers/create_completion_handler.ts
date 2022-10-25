import { ApiRequest, ApiResponse, IApiHandler } from '../../api_server/api_server_types';
import {
  CreateCompletionRequest,
  CreateCompletionResponse,
} from '../../proto/history-crud-service';
import { ICompletedStore, IStorage } from '../../storage/storage';
import {
  convertToProtoCompletion,
  convertToStoredCompletion,
  StoredCompletion,
} from '../../model/completion_store_model';

class CreateCompletionHandler
implements IApiHandler<CreateCompletionRequest, CreateCompletionResponse> {
  completedStore: ICompletedStore;

  constructor(storage: IStorage) {
    this.completedStore = storage.getCompletionStore();
  }

  async handle(apiRequest: ApiRequest<CreateCompletionRequest>):
  Promise<ApiResponse<CreateCompletionResponse>> {
    const { request } = apiRequest;

    if (!request.completed) {
      return CreateCompletionHandler.buildErrorResponse('Invalid completion information');
    }

    const convertedCompletion = convertToStoredCompletion(request.completed);
    if (!convertedCompletion) {
      return CreateCompletionHandler.buildErrorResponse('Missing completion information');
    }

    let completedEntity: StoredCompletion | undefined;
    try {
      completedEntity = await this.completedStore.addCompletion(convertedCompletion);
    } catch (err) {
      return CreateCompletionHandler.buildErrorResponse(`${err}`);
    }

    const resultCompletion = convertToProtoCompletion(completedEntity);
    if (!resultCompletion) {
      return CreateCompletionHandler.buildErrorResponse('An internal error occurred');
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
  ApiResponse<CreateCompletionResponse> {
    return {
      response: {
        errorMessage,
        completed: undefined,
      },
      headers: {},
    };
  }
}

export default CreateCompletionHandler;
