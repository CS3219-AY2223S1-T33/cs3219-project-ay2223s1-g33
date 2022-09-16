import { EditQuestionRequest, EditQuestionResponse } from '../../proto/question-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IQuestionStore } from '../../storage/storage.d';

class EditQuestionHandler implements IApiHandler<EditQuestionRequest, EditQuestionResponse> {
  questionStore: IQuestionStore;

  constructor(storage: IStorage) {
    this.questionStore = storage.getQuestionStore();
  }

  async handle(request: EditQuestionRequest): Promise<EditQuestionResponse> {
    if (!request.question) {
      return {
        question: undefined,
        errorMessage: 'Invalid question information',
      };
    }

    try {
      await this.questionStore.replaceQuestion(request.question);
    } catch (err) {
      return {
        question: undefined,
        errorMessage: `${err}`,
      };
    }

    return {
      question: request.question,
      errorMessage: '',
    };
  }
}

export default EditQuestionHandler;
