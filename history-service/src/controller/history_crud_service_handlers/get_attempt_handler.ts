import { GetAttemptRequest, GetAttemptResponse } from '../../proto/history-crud-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IAttemptStore } from '../../storage/storage';
import { convertToProtoAttempt } from '../../model/attempt_store_model';

class GetAttemptHandler implements IApiHandler<GetAttemptRequest, GetAttemptResponse> {
  attemptStore: IAttemptStore;

  constructor(storage: IStorage) {
    this.attemptStore = storage.getAttemptStore();
  }

  async handle(request: GetAttemptRequest): Promise<GetAttemptResponse> {
    if (!request.attemptId) {
      return {
        attempt: undefined,
        errorMessage: 'No attempt ID supplied',
      };
    }

    const attemptObject = await this.attemptStore.getAttempt(request.attemptId);
    if (!attemptObject) {
      return {
        attempt: undefined,
        errorMessage: 'No such attempt found',
      };
    }

    const resultObject = convertToProtoAttempt(attemptObject);
    if (!resultObject) {
      return {
        attempt: undefined,
        errorMessage: 'An internal error occurred',
      };
    }

    return {
      attempt: resultObject,
      errorMessage: '',
    };
  }
}

export default GetAttemptHandler;
