import { DeleteAttemptRequest, DeleteAttemptResponse } from '../../proto/history-crud-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IAttemptStore } from '../../storage/storage';

class DeleteAttemptHandler implements IApiHandler<DeleteAttemptRequest, DeleteAttemptResponse> {
  attemptStore: IAttemptStore;

  constructor(storage: IStorage) {
    this.attemptStore = storage.getAttemptStore();
  }

  async handle(request: DeleteAttemptRequest): Promise<DeleteAttemptResponse> {
    if (request.attemptId <= 0) {
      return {
        errorMessage: 'Malformed request',
      };
    }

    await this.attemptStore.removeAttempt(request.attemptId);

    return {
      errorMessage: '',
    };
  }
}

export default DeleteAttemptHandler;
