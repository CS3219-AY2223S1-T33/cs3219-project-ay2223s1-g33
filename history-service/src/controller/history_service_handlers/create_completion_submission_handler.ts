import {
  IApiHandler,
  ApiRequest,
  ApiResponse,
} from '../../api_server/api_server_types';
import {
  SetHistoryCompletionRequest,
  SetHistoryCompletionResponse,
} from '../../proto/history-service';
import { IHistoryCrudService } from '../../proto/history-crud-service.grpc-server';
import { CreateCompletionRequest, CreateCompletionResponse } from '../../proto/history-crud-service';
import { ILoopbackServiceChannel } from '../../api_server/loopback_server_types';

class SetHistoryCompletionHandler
implements IApiHandler<SetHistoryCompletionRequest, SetHistoryCompletionResponse> {
  crudLoopbackChannel: ILoopbackServiceChannel<IHistoryCrudService>;

  constructor(crudLoopbackChannel: ILoopbackServiceChannel<IHistoryCrudService>) {
    this.crudLoopbackChannel = crudLoopbackChannel;
  }

  async handle(apiRequest: ApiRequest<SetHistoryCompletionRequest>):
  Promise<ApiResponse<SetHistoryCompletionResponse>> {
    const { request } = apiRequest;

    if (!request.completed) {
      return SetHistoryCompletionHandler.buildErrorResponse('Invalid completion information');
    }

    const crudRequest: CreateCompletionRequest = {
      completed: request.completed,
    };

    let crudResult: CreateCompletionResponse;
    try {
      crudResult = await this.crudLoopbackChannel.client.createCompletion(crudRequest);
    } catch (err) {
      return SetHistoryCompletionHandler.buildErrorResponse(`${err}`);
    }

    if (crudResult.errorMessage !== '') {
      return SetHistoryCompletionHandler.buildErrorResponse(crudResult.errorMessage);
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

export default SetHistoryCompletionHandler;
