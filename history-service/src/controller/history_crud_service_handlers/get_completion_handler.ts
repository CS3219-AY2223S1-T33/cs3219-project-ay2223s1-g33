import { ApiRequest, ApiResponse, IApiHandler } from '../../api_server/api_server_types';
import { ICompletedStore, IStorage } from '../../storage/storage';
import {
  convertToProtoCompletion,
  StoredCompletion,
} from '../../model/completion_store_model';
import { GetCompletionRequest, GetCompletionResponse } from '../../proto/history-crud-service';
import BaseHandler from './base_handler';
import { UserCrudServiceClient } from '../../proto/user-crud-service.grpc-client';
import { QuestionServiceClient } from '../../proto/question-service.grpc-client';

class GetCompletionHandler extends BaseHandler
  implements IApiHandler<GetCompletionRequest, GetCompletionResponse> {
  completedStore: ICompletedStore;

  constructor(
    storage: IStorage,
    userGrpcClient: UserCrudServiceClient,
    questionGrpcClient: QuestionServiceClient,
  ) {
    super(userGrpcClient, questionGrpcClient);
    this.completedStore = storage.getCompletionStore();
  }

  async handle(apiRequest: ApiRequest<GetCompletionRequest>):
  Promise<ApiResponse<GetCompletionResponse>> {
    const { request } = apiRequest;

    if (!request.username) {
      return GetCompletionHandler.buildErrorResponse('No username supplied');
    }

    if (!request.questionId) {
      return GetCompletionHandler.buildErrorResponse('No question ID supplied');
    }

    const user = await super.getUserByUsername(request.username);
    if (!user?.userInfo) {
      return GetCompletionHandler.buildErrorResponse('User does not exist');
    }
    if (!(await super.checkQuestionExist(request.questionId))) {
      return GetCompletionHandler.buildErrorResponse('Question does not exist');
    }

    let completedEntity: StoredCompletion | undefined;
    try {
      completedEntity = await this.completedStore.getCompletion(
        user.userInfo.userId,
        request.questionId,
      );
    } catch (err) {
      return GetCompletionHandler.buildErrorResponse(`${err}`);
    }

    const resultCompletion = convertToProtoCompletion(
      user.userInfo.username,
      completedEntity,
    );
    if (!resultCompletion) {
      return GetCompletionHandler.buildErrorResponse('An internal error occurred');
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
