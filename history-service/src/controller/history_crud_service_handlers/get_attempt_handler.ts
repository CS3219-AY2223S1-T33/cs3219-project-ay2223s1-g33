import { GetAttemptRequest, GetAttemptResponse } from '../../proto/history-crud-service';
import { ApiRequest, ApiResponse, IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IAttemptStore } from '../../storage/storage';
import { convertToProtoAttempt } from '../../model/attempt_store_model';
import BaseHandler from './base_handler';
import { UserCrudServiceClient } from '../../proto/user-crud-service.grpc-client';
import { QuestionServiceClient } from '../../proto/question-service.grpc-client';

class GetAttemptHandler extends BaseHandler
  implements IApiHandler<GetAttemptRequest, GetAttemptResponse> {
  attemptStore: IAttemptStore;

  constructor(
    storage: IStorage,
    userGrpcClient: UserCrudServiceClient,
    questionGrpcClient: QuestionServiceClient,
  ) {
    super(userGrpcClient, questionGrpcClient);
    this.attemptStore = storage.getAttemptStore();
  }

  async handle(apiRequest: ApiRequest<GetAttemptRequest>):
  Promise<ApiResponse<GetAttemptResponse>> {
    const { request } = apiRequest;
    if (!request.attemptId) {
      return GetAttemptHandler.buildErrorResponse('No attempt ID supplied');
    }

    const attemptObject = await this.attemptStore.getAttempt(request.attemptId);
    if (!attemptObject) {
      return GetAttemptHandler.buildErrorResponse('No such attempt found');
    }

    const userObjectPromise = super.fetchUsersFor([attemptObject]);
    const questionMapPromise = super.createQuestionMap([attemptObject]);

    const userObjects = await userObjectPromise;
    const questionMap = await questionMapPromise;

    if (request.username !== '') {
      const match = userObjects.find((x) => {
        if (!x || !x.userInfo) {
          return false;
        }
        return x.userInfo.username === request.username;
      });

      if (!match) {
        return GetAttemptHandler.buildHeaderlessResponse({
          attempt: undefined,
          errorMessage: '',
        });
      }
    }

    const resultObject = convertToProtoAttempt(
      attemptObject,
      super.createNicknameMapFrom(userObjects),
      questionMap,
    );
    if (!resultObject) {
      return GetAttemptHandler.buildErrorResponse('An internal error occurred');
    }

    return GetAttemptHandler.buildHeaderlessResponse({
      attempt: resultObject,
      errorMessage: '',
    });
  }

  static buildErrorResponse(errorMessage: string): ApiResponse<GetAttemptResponse> {
    return {
      response: {
        errorMessage,
        attempt: undefined,
      },
      headers: {},
    };
  }

  static buildHeaderlessResponse(response: GetAttemptResponse): ApiResponse<GetAttemptResponse> {
    return {
      response,
      headers: {},
    };
  }
}

export default GetAttemptHandler;
