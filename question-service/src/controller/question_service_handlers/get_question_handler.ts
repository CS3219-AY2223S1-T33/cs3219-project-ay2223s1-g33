import { Question } from '../../proto/types';
import { GetQuestionRequest, GetQuestionResponse } from '../../proto/question-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IQuestionStore } from '../../storage/storage.d';
import { StoredQuestion } from '../../model/question_store_model';

class GetQuestionHandler implements IApiHandler<GetQuestionRequest, GetQuestionResponse> {
  questionStore: IQuestionStore;

  constructor(storage: IStorage) {
    this.questionStore = storage.getQuestionStore();
  }

  async handle(request: GetQuestionRequest): Promise<GetQuestionResponse> {
    if (request.question) {
      if (request.question.difficulty) {
        const question : StoredQuestion | undefined = await
        this.questionStore.getRandomQuestionByDifficulty(request.question.difficulty);

        const resultQuestionModel : Question | undefined = {
          questionId: question?.questionId!,
          name: question?.name!,
          difficulty: question?.difficulty!,
          content: question?.content!,
          solution: question?.solution!,
        };

        return {
          question: resultQuestionModel,
          errorMessage: '',
        };
      }

      if (request.question.name !== '') {
        const question : StoredQuestion | undefined = await
        this.questionStore.getQuestionByName(request.question.name);

        const resultQuestionModel : Question | undefined = {
          questionId: question?.questionId!,
          name: question?.name!,
          difficulty: question?.difficulty!,
          content: question?.content!,
          solution: question?.solution!,
        };

        return {
          question: resultQuestionModel,
          errorMessage: '',
        };
      }

      if (request.question.questionId > 0) {
        const question : StoredQuestion | undefined = await
        this.questionStore.getQuestion(request.question.questionId);

        const resultQuestionModel : Question | undefined = {
          questionId: question?.questionId!,
          name: question?.name!,
          difficulty: question?.difficulty!,
          content: question?.content!,
          solution: question?.solution!,
        };

        return {
          question: resultQuestionModel,
          errorMessage: '',
        };
      }
    }

    return {
      question: undefined,
      errorMessage: 'Malformed request',
    };
  }
}

export default GetQuestionHandler;
