import { HistoryAttempt } from '../../proto/types';
import { GetAttemptsRequest, GetAttemptsResponse } from '../../proto/history-crud-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IStorage, IAttemptStore, AttemptStoreSearchResult } from '../../storage/storage';
import { convertToProtoAttempt } from '../../model/attempt_store_model';

class GetAttemptsHandler implements IApiHandler<GetAttemptsRequest, GetAttemptsResponse> {
  attemptStore: IAttemptStore;

  constructor(storage: IStorage) {
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

    let result: AttemptStoreSearchResult;

    if (request.questionId) {
      if (!request.username) {
        return GetAttemptsHandler.buildErrorResponse('Username must be supplied for questionId filter');
      }
      result = await this.attemptStore.getAttemptByUsernameAndQuestionId(
        request.username,
        request.questionId,
        limit,
        offset,
      );
    } else if (request.userId) {
      result = await this.attemptStore.getAttemptByUserId(
        request.userId,
        limit,
        offset,
      );
    } else if (request.username) {
      result = await this.attemptStore.getAttemptByUsername(
        request.username,
        limit,
        offset,
      );
    } else {
      return GetAttemptsHandler.buildErrorResponse('Malformed request');
    }

    return {
      response: {
        attempts: result.attempts
          .map((x) => convertToProtoAttempt(x))
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
