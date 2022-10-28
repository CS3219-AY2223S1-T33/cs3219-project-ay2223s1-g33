import BaseHandler from './base_handler';
import { ApiRequest, ApiResponse, IApiHandler } from '../../api_server/api_server_types';
import {
  DeleteCompletionRequest, DeleteCompletionResponse,
} from '../../proto/history-crud-service';
import { ICompletedStore, IStorage } from '../../storage/storage';
import { UserCrudServiceClient } from '../../proto/user-crud-service.grpc-client';
import { QuestionServiceClient } from '../../proto/question-service.grpc-client';

class DeleteCompletionHandler extends BaseHandler
  implements IApiHandler<DeleteCompletionRequest, DeleteCompletionResponse> {
  completedStore: ICompletedStore;

  constructor(
    storage: IStorage,
    userGrpcClient: UserCrudServiceClient,
    questionGrpcClient: QuestionServiceClient,
  ) {
    super(userGrpcClient, questionGrpcClient);
    this.completedStore = storage.getCompletionStore();
  }

  async handle(apiRequest: ApiRequest<DeleteCompletionRequest>):
  Promise<ApiResponse<DeleteCompletionResponse>> {
    const { request } = apiRequest;

    if (!request.completed) {
      return DeleteCompletionHandler.buildErrorResponse('Invalid completion information');
    }

    if ((!request.completed.username || !request.completed.questionId)) {
      return DeleteCompletionHandler.buildErrorResponse('Missing completion information');
    }

    const user = await super.getUserByUsername(request.completed.username);
    if (!user?.userInfo) {
      return DeleteCompletionHandler.buildErrorResponse('User does not exist');
    }
    if (!(await super.checkQuestionExist(request.completed.questionId))) {
      return DeleteCompletionHandler.buildErrorResponse('Question does not exist');
    }

    try {
      await this.completedStore.removeCompletion(
        user.userInfo.userId,
        request.completed.questionId,
      );
    } catch (err) {
      return DeleteCompletionHandler.buildErrorResponse(`${err}`);
    }

    return DeleteCompletionHandler.buildErrorResponse('');
  }

  static buildErrorResponse(errorMessage: string):
  ApiResponse<DeleteCompletionResponse> {
    return {
      response: {
        errorMessage,
      },
      headers: {},
    };
  }
}

export default DeleteCompletionHandler;
