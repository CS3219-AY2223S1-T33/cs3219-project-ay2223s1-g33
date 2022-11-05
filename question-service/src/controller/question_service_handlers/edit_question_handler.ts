import { EditQuestionRequest, EditQuestionResponse } from '../../proto/question-service';
import { ApiRequest, ApiResponse, IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IQuestionStore } from '../../storage/storage.d';
import { QuestionDifficulty } from '../../proto/types';

class EditQuestionHandler implements IApiHandler<EditQuestionRequest, EditQuestionResponse> {
  questionStore: IQuestionStore;

  constructor(storage: IStorage) {
    this.questionStore = storage.getQuestionStore();
  }

  async handle(
    apiRequest: ApiRequest<EditQuestionRequest>,
  ): Promise<ApiResponse<EditQuestionResponse>> {
    const { request } = apiRequest;
    if (!request.question) {
      return EditQuestionHandler.buildErrorResponse('Invalid question information');
    }

    if (request.question.questionId <= 0) {
      return EditQuestionHandler.buildErrorResponse('Invalid question information');
    }

    if (
      request.question.content.length === 0
      || request.question.name.length === 0
      || request.question.solution.length === 0
      || request.question.executionInput.length === 0
    ) {
      return EditQuestionHandler.buildErrorResponse('Missing question information');
    }

    if (
      request.question.difficulty === QuestionDifficulty.UNUSED
      || !Object.values(QuestionDifficulty).includes(request.question.difficulty)
    ) {
      return EditQuestionHandler.buildErrorResponse('Invalid question difficulty');
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
    };
  }
}

export default EditQuestionHandler;
