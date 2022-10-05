import { EditQuestionRequest, EditQuestionResponse } from '../../proto/question-service';
import { ApiRequest, ApiResponse, IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IQuestionStore } from '../../storage/storage.d';

class EditQuestionHandler implements IApiHandler<EditQuestionRequest, EditQuestionResponse> {
  questionStore: IQuestionStore;

  constructor(storage: IStorage) {
    this.questionStore = storage.getQuestionStore();
  }

  async handle(apiRequest: ApiRequest<EditQuestionRequest>): Promise<ApiResponse<EditQuestionResponse>> {
    const { request } = apiRequest;
    if (!request.question) {
      return EditQuestionHandler.buildErrorResponse('Invalid question information');
    }

    try {
      await this.questionStore.replaceQuestion(request.question);
    } catch (err) {
      return EditQuestionHandler.buildErrorResponse(`${err}`);
    }

    return {
      response: {
        question: request.question,
        errorMessage: '',
      },
      headers: {},
    };
  }

  static buildErrorResponse(errorMessage: string): ApiResponse<EditQuestionResponse> {
    return {
      response: {
        question: undefined,
        errorMessage,
      },
      headers: {},
    }
  }
}

export default EditQuestionHandler;
