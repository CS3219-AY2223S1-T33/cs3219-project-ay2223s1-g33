import { HistoryAttempt, User } from '../../proto/types';
import { GetAttemptsRequest, GetAttemptsResponse } from '../../proto/history-crud-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IStorage, IAttemptStore, AttemptStoreSearchResult } from '../../storage/storage';
import { convertToProtoAttempt } from '../../model/attempt_store_model';
import { UserCrudServiceClient } from '../../proto/user-crud-service.grpc-client';
import { QuestionServiceClient } from '../../proto/question-service.grpc-client';
import BaseHandler from './base_handler';

class GetAttemptsHandler extends BaseHandler
  implements IApiHandler<GetAttemptsRequest, GetAttemptsResponse> {
  attemptStore: IAttemptStore;

  constructor(
    storage: IStorage,
    userGrpcClient: UserCrudServiceClient,
    questionGrpcClient: QuestionServiceClient,
  ) {
    super(userGrpcClient, questionGrpcClient);
    this.attemptStore = storage.getAttemptStore();
  }

  async handle(apiRequest: ApiRequest<GetAttemptsRequest>):
  Promise<ApiResponse<GetAttemptsResponse>> {
    const { request } = apiRequest;

    let limit = 50;
    let offset = 0;

    if (request.limit) {
      limit = request.limit;
    }

    if (request.offset) {
      offset = request.offset;
    }

    if (!request.userId && !request.username) {
      return GetAttemptsHandler.buildErrorResponse('UserId or Username must be supplied');
    }

    let { userId } = request;
    if (request.username) {
      // Convert to user ID
      const userObject = await super.getUser(User.create({
        username: request.username,
      }));

      if (!userObject || !userObject.userInfo) {
        return GetAttemptsHandler.buildErrorResponse('Username is invalid');
      }

      userId = userObject.userInfo?.userId;
    }

    let result: AttemptStoreSearchResult;

    if (request.questionId) {
      result = await this.attemptStore.getAttemptByUserIdAndQuestionId(
        userId,
        request.questionId,
        limit,
        offset,
      );
    } else {
      result = await this.attemptStore.getAttemptByUserId(
        userId,
        limit,
        offset,
      );
    }

    const nicknameMapPromise = super.createNicknameMap(result.attempts);
    const questionMapPromise = super.createQuestionMap(result.attempts);

    const nicknameMap = await nicknameMapPromise;
    const questionMap = await questionMapPromise;

    return {
      response: {
        attempts: result.attempts
          .map((x) => convertToProtoAttempt(x, nicknameMap, questionMap))
          .filter((x) => x !== undefined)
          .map((x) => x as HistoryAttempt),
        totalCount: result.totalCount,
        errorMessage: '',
      },
      headers: {},
    };
  }

  static buildErrorResponse(errorMessage: string): ApiResponse<GetAttemptsResponse> {
    return {
      response: {
        errorMessage,
        attempts: [],
        totalCount: 0,
      },
      headers: {},
    };
  }
}

export default GetAttemptsHandler;
