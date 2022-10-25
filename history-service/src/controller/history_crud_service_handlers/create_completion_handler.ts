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
import BaseHandler from './base_handler';
import { UserCrudServiceClient } from '../../proto/user-crud-service.grpc-client';
import { QuestionServiceClient } from '../../proto/question-service.grpc-client';
import { Question, User } from '../../proto/types';

class CreateCompletionHandler extends BaseHandler
  implements IApiHandler<CreateCompletionRequest, CreateCompletionResponse> {
  completedStore: ICompletedStore;

  constructor(
    storage: IStorage,
    userGrpcClient: UserCrudServiceClient,
    questionGrpcClient: QuestionServiceClient,
  ) {
    super(userGrpcClient, questionGrpcClient);
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

    if (!(await this.checkUserExist(request.completed.userId))) {
      return CreateCompletionHandler.buildErrorResponse('User does not exist');
    }
    if (!(await this.checkQuestionExist(request.completed.questionId))) {
      return CreateCompletionHandler.buildErrorResponse('Question does not exist');
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

  async checkUserExist(userId: number): Promise<boolean> {
    const searchUserObject: User = User.create();
    searchUserObject.userId = userId;
    try {
      const user = await super.getUser(searchUserObject);
      return user !== undefined;
    } catch (err) {
      return false;
    }
  }

  async checkQuestionExist(questionId: number): Promise<boolean> {
    const searchQuestionObject: Question = Question.create();
    searchQuestionObject.questionId = questionId;
    try {
      const question = await super.getQuestion(searchQuestionObject);
      return question !== undefined;
    } catch (err) {
      return false;
    }
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
