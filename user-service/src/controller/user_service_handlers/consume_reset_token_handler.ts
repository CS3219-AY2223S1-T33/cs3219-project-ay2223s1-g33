import { ConsumeResetTokenRequest, ConsumeResetTokenResponse, ConsumeResetTokenErrorCode } from '../../proto/user-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';

class ConsumeResetTokenHandler
implements IApiHandler<ConsumeResetTokenRequest, ConsumeResetTokenResponse> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  async handle(request: ApiRequest<ConsumeResetTokenRequest>):
  Promise<ApiResponse<ConsumeResetTokenResponse>> {
    return ConsumeResetTokenHandler.buildErrorResponse(
      ConsumeResetTokenErrorCode.CONSUME_RESET_TOKEN_ERROR_INTERNAL_ERROR,
      'Method Not Implemented',
    );
  }

  static buildErrorResponse(errorCode: ConsumeResetTokenErrorCode, errorMessage: string)
    : ApiResponse<ConsumeResetTokenResponse> {
    return {
      response: {
        errorCode,
        errorMessage,
      },
      headers: {},
    };
  }
}

export default ConsumeResetTokenHandler;
