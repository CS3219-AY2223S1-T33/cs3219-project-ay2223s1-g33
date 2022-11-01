import { Question } from '../../proto/types';
import { GetQuestionRequest, GetQuestionResponse } from '../../proto/question-service';
import { ApiRequest, ApiResponse, IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IQuestionStore } from '../../storage/storage.d';
import { StoredQuestion } from '../../model/question_store_model';

class GetQuestionHandler implements IApiHandler<GetQuestionRequest, GetQuestionResponse> {
  questionStore: IQuestionStore;

  constructor(storage: IStorage) {
    this.questionStore = storage.getQuestionStore();
  }

  async handle(
    apiRequest: ApiRequest<GetQuestionRequest>,
  ): Promise<ApiResponse<GetQuestionResponse>> {
    const { request } = apiRequest;

    if (!request.question) {
      return GetQuestionHandler.buildErrorResponse('Malformed request');
    }

    let questionResult: StoredQuestion | undefined;
    try {
      if (request.question.questionId > 0) {
        questionResult = await this.questionStore.getQuestion(request.question.questionId);
      } else if (request.question.name !== '') {
        questionResult = await this.questionStore.getQuestionByName(request.question.name);
      } else if (request.question.difficulty) {
        questionResult = await this.questionStore.getRandomQuestionByDifficulty(
          request.question.difficulty,
        );
      }
    } catch {
      return GetQuestionHandler.buildErrorResponse('Database Error');
    }

    if (!questionResult) {
      return GetQuestionHandler.buildErrorResponse('Malformed request');
    }

    const resultQuestionModel = Question.create(questionResult);
    return {
      response: {
        question: resultQuestionModel,
        errorMessage: '',
      },
      headers: {},
    };
  }

  static buildErrorResponse(errorMessage: string): ApiResponse<GetQuestionResponse> {
    return {
      response: {
        question: undefined,
        errorMessage,
      },
      headers: {},
    };
  }
}

export default GetQuestionHandler;
