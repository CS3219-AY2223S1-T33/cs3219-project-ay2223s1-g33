import { DeleteQuestionRequest, DeleteQuestionResponse } from '../../proto/question-service';
import { ApiRequest, ApiResponse, IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IQuestionStore } from '../../storage/storage';

class DeleteQuestionHandler implements IApiHandler<DeleteQuestionRequest, DeleteQuestionResponse> {
  questionStore: IQuestionStore;

  redisStream: IStreamProducer;

  constructor(storage: IStorage, redisStream: IStreamProducer) {
    this.questionStore = storage.getQuestionStore();
    this.redisStream = redisStream;
  }

  async handle(apiRequest: ApiRequest<DeleteQuestionRequest>):
  Promise<ApiResponse<DeleteQuestionResponse>> {
    const { request } = apiRequest;
    if (request.questionId <= 0) {
      return {
        response: {
          errorMessage: 'Malformed request',
        },
        headers: {},
      };
    }

    try {
      await this.questionStore.removeQuestion(request.questionId);
    } catch {
      return {
        response: {
          errorMessage: 'Database Error',
        },
        headers: {},
      };
    }

    // Push delete-change to Stream
    try {
      await this.redisStream.pushMessage(request.questionId.toString());
    } catch {
      return {
        response: {
          errorMessage: 'Redis Error',
        },
        headers: {},
      };
    }
    return {
      response: {
        errorMessage: '',
      },
      headers: {},
    };
  }
}

export default DeleteQuestionHandler;
