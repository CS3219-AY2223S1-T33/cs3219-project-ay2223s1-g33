import { Question } from '../../proto/types';
import { CreateQuestionRequest, CreateQuestionResponse } from '../../proto/question-service';
import { ApiRequest, ApiResponse, IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IQuestionStore } from '../../storage/storage.d';
import { StoredQuestion } from '../../model/question_store_model';

class CreateQuestionHandler implements IApiHandler<CreateQuestionRequest, CreateQuestionResponse> {
  questionStore: IQuestionStore;

  constructor(storage: IStorage) {
    this.questionStore = storage.getQuestionStore();
  }

  async handle(apiRequest: ApiRequest<CreateQuestionRequest>): Promise<ApiResponse<CreateQuestionResponse>> {
    const { request } = apiRequest;

    if (!request.question) {
      return CreateQuestionHandler.buildErrorResponse('Invalid question information');
    }

    let question: StoredQuestion | undefined;
    try {
      question = await this.questionStore.addQuestion(request.question);
    } catch (err) {
      return CreateQuestionHandler.buildErrorResponse(`${err}`);
    }

    const resultQuestionModel : Question = {
      questionId: question.questionId!,
      ...question,
    };

    return {
      response: {
        question: resultQuestionModel,
        errorMessage: '',
      },
      headers: {},
    };
  }

  static buildErrorResponse(errorMessage: string): ApiResponse<CreateQuestionResponse> {
    return {
      response: {
        question: undefined,
        errorMessage,
      },
      headers: {},
    }
  }
}

export default CreateQuestionHandler;
