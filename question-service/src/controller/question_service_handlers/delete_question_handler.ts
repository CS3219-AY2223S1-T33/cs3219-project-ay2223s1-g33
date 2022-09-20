import { DeleteQuestionRequest, DeleteQuestionResponse } from '../../proto/question-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IQuestionStore } from '../../storage/storage';

class DeleteQuestionHandler implements IApiHandler<DeleteQuestionRequest, DeleteQuestionResponse> {
  questionStore: IQuestionStore;

  constructor(storage: IStorage) {
    this.questionStore = storage.getQuestionStore();
  }

  async handle(request: DeleteQuestionRequest): Promise<DeleteQuestionResponse> {
    if (request.questionId <= 0) {
      return {
        errorMessage: 'Malformed request',
      };
    }

    await this.questionStore.removeQuestion(request.questionId);

    return {
      errorMessage: '',
    };
  }
}

export default DeleteQuestionHandler;
