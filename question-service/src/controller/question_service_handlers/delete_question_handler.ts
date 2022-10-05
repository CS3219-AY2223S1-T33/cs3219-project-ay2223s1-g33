import { DeleteQuestionRequest, DeleteQuestionResponse } from '../../proto/question-service';
import { ApiRequest, ApiResponse, IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IQuestionStore } from '../../storage/storage';

class DeleteQuestionHandler implements IApiHandler<DeleteQuestionRequest, DeleteQuestionResponse> {
  questionStore: IQuestionStore;

  constructor(storage: IStorage) {
    this.questionStore = storage.getQuestionStore();
  }

  async handle(apiRequest: ApiRequest<DeleteQuestionRequest>):
  Promise<ApiResponse<DeleteQuestionResponse>> {
    const { request } = apiRequest;
    if (request.questionId <= 0) {
      return {
        response: {
          errorMessage: 'Malformed request',
        },
        headers: {},
      };
    }

    await this.questionStore.removeQuestion(request.questionId);

    return {
      response: {
        errorMessage: '',
      },
      headers: {},
    };
  }
}

export default DeleteQuestionHandler;
