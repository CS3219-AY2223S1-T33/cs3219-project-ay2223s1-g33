import { Question } from '../../proto/types';
import { CreateQuestionRequest, CreateQuestionResponse } from '../../proto/question-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IQuestionStore } from '../../storage/storage.d';
import { StoredQuestion } from '../../model/question_store_model';

class CreateQuestionHandler implements IApiHandler<CreateQuestionRequest, CreateQuestionResponse> {
  questionStore: IQuestionStore;

  constructor(storage: IStorage) {
    this.questionStore = storage.getQuestionStore();
  }

  async handle(request: CreateQuestionRequest): Promise<CreateQuestionResponse> {
    if (!request.question) {
      return {
        question: undefined,
        errorMessage: 'Invalid question information',
      };
    }

    let question: StoredQuestion | undefined;
    try {
      question = await this.questionStore.addQuestion(request.question);
    } catch (err) {
      return {
        question: undefined,
        errorMessage: `${err}`,
      };
    }

    const resultQuestionModel : Question = {
      questionId: question.questionId!,
      ...question,
    };

    return {
      question: resultQuestionModel,
      errorMessage: '',
    };
  }
}

export default CreateQuestionHandler;
