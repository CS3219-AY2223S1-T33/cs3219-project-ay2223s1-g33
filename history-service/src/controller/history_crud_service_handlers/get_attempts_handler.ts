import { HistoryAttempt } from '../../proto/types';
import { GetAttemptsRequest, GetAttemptsResponse } from '../../proto/history-crud-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IAttemptStore } from '../../storage/storage';
import { convertToProtoAttempt, StoredAttempt } from '../../model/attempt_store_model';

class GetQuestionHandler implements IApiHandler<GetAttemptsRequest, GetAttemptsResponse> {
  attemptStore: IAttemptStore;

  constructor(storage: IStorage) {
    this.attemptStore = storage.getAttemptStore();
  }

  async handle(request: GetAttemptsRequest): Promise<GetAttemptsResponse> {
    let limit = 50;
    let offset = 0;

    if (request.limit) {
      limit = request.limit;
    }

    if (request.offset) {
      offset = request.offset;
    }

    if (!request.userId && !request.username) {
      return {
        attempts: [],
        errorMessage: 'UserId or Username must be supplied',
      };
    }

    let storedAttempts: StoredAttempt[] = [];

    if (request.questionId) {
      if (!request.username) {
        return {
          attempts: [],
          errorMessage: 'Username must be supplied for questionId filter',
        };
      }

      storedAttempts = await this.attemptStore.getAttemptByUsernameAndQuestionId(
        request.username,
        request.questionId,
        limit,
        offset,
      );
    } else if (request.userId) {
      storedAttempts = await this.attemptStore.getAttemptByUserId(
        request.userId,
        limit,
        offset,
      );
    } else if (request.username) {
      storedAttempts = await this.attemptStore.getAttemptByUsername(
        request.username,
        limit,
        offset,
      );
    } else {
      return {
        attempts: [],
        errorMessage: 'Malformed request',
      };
    }

    return {
      attempts: storedAttempts
        .map((x) => convertToProtoAttempt(x))
        .filter((x) => x !== undefined)
        .map((x) => x as HistoryAttempt),
      errorMessage: '',
    };
  }
}

export default GetQuestionHandler;
