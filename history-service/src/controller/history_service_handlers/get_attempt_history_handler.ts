import {
  IApiHandler,
  ILoopbackServiceChannel,
  ApiRequest,
  ApiResponse,
} from '../../api_server/api_server_types';
import { GetAttemptHistoryRequest, GetAttemptHistoryResponse } from '../../proto/history-service';
import { IHistoryCrudService } from '../../proto/history-crud-service.grpc-server';
import { GetAttemptsRequest, GetAttemptsResponse } from '../../proto/history-crud-service';

const gatewayHeaderUsername = 'grpc-x-bearer-username';

class GetAttemptHistoryHandler
implements IApiHandler<GetAttemptHistoryRequest, GetAttemptHistoryResponse> {
  crudLoopbackChannel: ILoopbackServiceChannel<IHistoryCrudService>;

  constructor(crudLoopbackChannel: ILoopbackServiceChannel<IHistoryCrudService>) {
    this.crudLoopbackChannel = crudLoopbackChannel;
  }

  async handle(apiRequest: ApiRequest<GetAttemptHistoryRequest>):
  Promise<ApiResponse<GetAttemptHistoryResponse>> {
    if (!(gatewayHeaderUsername in apiRequest.headers)) {
      return GetAttemptHistoryHandler.buildErrorResponse('Bad request from gateway');
    }

    const username = apiRequest.headers[gatewayHeaderUsername][0];

    let limit = 50;
    let offset = 0;
    let questionId = 0;
    const { request } = apiRequest;

    if (request.limit) {
      limit = request.limit;
    }

    if (request.offset) {
      offset = request.offset;
    }

    if (request.questionId) {
      questionId = request.questionId;
    }

    const crudRequest: GetAttemptsRequest = {
      limit,
      offset,
      questionId,
      username,
      userId: 0,
    };

    let crudResult: GetAttemptsResponse;
    try {
      crudResult = await this.crudLoopbackChannel
        .callRoute<GetAttemptsRequest, GetAttemptsResponse>('getAttempts', crudRequest, GetAttemptsResponse);
    } catch (ex) {
      return GetAttemptHistoryHandler.buildErrorResponse(`${ex}`);
    }

    if (crudResult.errorMessage !== '') {
      return GetAttemptHistoryHandler.buildErrorResponse(crudResult.errorMessage);
    }

    return {
      headers: {},
      response: {
        attempts: crudResult.attempts,
        errorMessage: '',
      },
    };
  }

  static buildErrorResponse(errorMessage: string):
  ApiResponse<GetAttemptHistoryResponse> {
    return {
      response: {
        errorMessage,
        attempts: [],
      },
      headers: {},
    };
  }
}

export default GetAttemptHistoryHandler;
