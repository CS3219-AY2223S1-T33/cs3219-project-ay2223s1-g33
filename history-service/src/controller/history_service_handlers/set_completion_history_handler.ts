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
import {
  CreateCompletionRequest,
  CreateCompletionResponse,
  DeleteCompletionRequest,
  DeleteCompletionResponse,
  GetCompletionRequest,
  GetCompletionResponse,
} from '../../proto/history-crud-service';
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

    // Check if completion exist
    const crudGetRequest: GetCompletionRequest = {
      username: request.completed.username,
      questionId: request.completed.questionId,
    };
    let crudGetResult: GetCompletionResponse;
    try {
      crudGetResult = await this.crudLoopbackChannel.client.getCompletion(crudGetRequest);
    } catch (err) {
      return SetHistoryCompletionHandler.buildErrorResponse(`${err}`);
    }
    if (crudGetResult.errorMessage !== '') {
      return SetHistoryCompletionHandler.buildErrorResponse(crudGetResult.errorMessage);
    }

    let response: ApiResponse<SetHistoryCompletionResponse>;
    if (crudGetResult.completed) {
      // Completion exist, toggle delete
      response = await this.deleteCompletionRequest(request);
    } else {
      // Completion doesn't exist, toggle create
      response = await this.createCompletionRequest(request);
    }
    return response;
  }

  private async deleteCompletionRequest(request: SetHistoryCompletionRequest):
  Promise<ApiResponse<SetHistoryCompletionResponse>> {
    const crudDeleteRequest: DeleteCompletionRequest = {
      completed: request.completed,
    };

    let crudDeleteResult: DeleteCompletionResponse;
    try {
      crudDeleteResult = await this.crudLoopbackChannel.client.deleteCompletion(
        crudDeleteRequest,
      );
    } catch (err) {
      return SetHistoryCompletionHandler.buildErrorResponse(`${err}`);
    }

    if (crudDeleteResult.errorMessage !== '') {
      return SetHistoryCompletionHandler.buildErrorResponse(crudDeleteResult.errorMessage);
    }

    return {
      headers: {},
      response: {
        completed: undefined,
        errorMessage: '',
      },
    };
  }

  private async createCompletionRequest(request: SetHistoryCompletionRequest):
  Promise<ApiResponse<SetHistoryCompletionResponse>> {
    const crudCreateRequest: CreateCompletionRequest = {
      completed: request.completed,
    };

    let crudResult: CreateCompletionResponse;
    try {
      crudResult = await this.crudLoopbackChannel.client.createCompletion(crudCreateRequest);
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
