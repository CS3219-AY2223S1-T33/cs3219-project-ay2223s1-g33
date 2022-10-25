import {
  IApiHandler,
  ApiRequest,
  ApiResponse,
} from '../../api_server/api_server_types';
import {
  CreateCompletionSubmissionRequest,
  CreateCompletionSubmissionResponse,
} from '../../proto/history-service';
import { IHistoryCrudService } from '../../proto/history-crud-service.grpc-server';
import { CreateCompletionRequest, CreateCompletionResponse } from '../../proto/history-crud-service';
import { ILoopbackServiceChannel } from '../../api_server/loopback_server_types';

class CreateCompletionSubmissionHandler
implements IApiHandler<CreateCompletionSubmissionRequest, CreateCompletionSubmissionResponse> {
  crudLoopbackChannel: ILoopbackServiceChannel<IHistoryCrudService>;

  constructor(crudLoopbackChannel: ILoopbackServiceChannel<IHistoryCrudService>) {
    this.crudLoopbackChannel = crudLoopbackChannel;
  }

  async handle(apiRequest: ApiRequest<CreateCompletionSubmissionRequest>):
  Promise<ApiResponse<CreateCompletionSubmissionResponse>> {
    const { request } = apiRequest;

    if (!request.completed) {
      return CreateCompletionSubmissionHandler.buildErrorResponse('Invalid completion information');
    }

    const crudRequest: CreateCompletionRequest = {
      completed: request.completed,
    };

    let crudResult: CreateCompletionResponse;
    try {
      crudResult = await this.crudLoopbackChannel.client.createCompletion(crudRequest);
    } catch (err) {
      return CreateCompletionSubmissionHandler.buildErrorResponse(`${err}`);
    }

    if (crudResult.errorMessage !== '') {
      return CreateCompletionSubmissionHandler.buildErrorResponse(crudResult.errorMessage);
    }

    return {
      headers: {},
      response: {
        completed: crudResult.completed,
        errorMessage: '',
      },
    };
  }

  static buildErrorResponse(errorMessage: string):
  ApiResponse<CreateCompletionResponse> {
    return {
      response: {
        completed: undefined,
        errorMessage,
      },
      headers: {},
    };
  }
}

export default CreateCompletionSubmissionHandler;
