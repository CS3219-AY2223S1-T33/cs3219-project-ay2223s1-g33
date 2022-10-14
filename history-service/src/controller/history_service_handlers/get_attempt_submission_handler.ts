import {
  IApiHandler,
  ILoopbackServiceChannel,
  ApiRequest,
  ApiResponse,
} from '../../api_server/api_server_types';
import { GetAttemptSubmissionRequest, GetAttemptSubmissionResponse } from '../../proto/history-service';
import { IHistoryCrudService } from '../../proto/history-crud-service.grpc-server';
import { GetAttemptRequest, GetAttemptResponse } from '../../proto/history-crud-service';

const gatewayHeaderUsername = 'grpc-x-bearer-username';

class GetAttemptSubmissionHandler
implements IApiHandler<GetAttemptSubmissionRequest, GetAttemptSubmissionResponse> {
  crudLoopbackChannel: ILoopbackServiceChannel<IHistoryCrudService>;

  constructor(crudLoopbackChannel: ILoopbackServiceChannel<IHistoryCrudService>) {
    this.crudLoopbackChannel = crudLoopbackChannel;
  }

  async handle(apiRequest: ApiRequest<GetAttemptSubmissionRequest>):
  Promise<ApiResponse<GetAttemptSubmissionResponse>> {
    if (!(gatewayHeaderUsername in apiRequest.headers)) {
      return GetAttemptSubmissionHandler.buildErrorResponse('Bad request from gateway');
    }

    const { request } = apiRequest;
    if (request.attemptId <= 0) {
      return GetAttemptSubmissionHandler.buildErrorResponse('Bad Request');
    }

    const username = apiRequest.headers[gatewayHeaderUsername][0];
    const crudRequest: GetAttemptRequest = {
      attemptId: request.attemptId,
      username,
    };

    let crudResult: GetAttemptResponse;
    try {
      crudResult = await this.crudLoopbackChannel
        .callRoute<GetAttemptRequest, GetAttemptResponse>('getAttempt', crudRequest, GetAttemptResponse);
    } catch (ex) {
      return GetAttemptSubmissionHandler.buildErrorResponse(`${ex}`);
    }

    if (crudResult.errorMessage !== '') {
      return GetAttemptSubmissionHandler.buildErrorResponse(crudResult.errorMessage);
    }

    if (!crudResult.attempt) {
      return GetAttemptSubmissionHandler.buildErrorResponse('Not Found');
    }

    return {
      headers: {},
      response: {
        attempt: crudResult.attempt,
        errorMessage: '',
      },
    };
  }

  static buildErrorResponse(errorMessage: string):
  ApiResponse<GetAttemptSubmissionResponse> {
    return {
      response: {
        errorMessage,
        attempt: undefined,
      },
      headers: {},
    };
  }
}

export default GetAttemptSubmissionHandler;
