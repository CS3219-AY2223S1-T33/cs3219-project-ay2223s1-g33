import { ResetPasswordRequest, ResetPasswordResponse, ResetPasswordErrorCode } from '../../proto/user-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';

class ResetPasswordHandler implements IApiHandler<ResetPasswordRequest, ResetPasswordResponse> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, class-methods-use-this
  async handle(request: ApiRequest<ResetPasswordRequest>):
  Promise<ApiResponse<ResetPasswordResponse>> {
    return ResetPasswordHandler.buildErrorResponse(
      ResetPasswordErrorCode.RESET_PASSWORD_ERROR_INTERNAL_ERROR,
      'Method Not Implemented',
    );
  }

  static buildErrorResponse(errorCode: ResetPasswordErrorCode, errorMessage: string)
    : ApiResponse<ResetPasswordResponse> {
    return {
      response: {
        errorCode,
        errorMessage,
      },
      headers: {},
    };
  }
}

export default ResetPasswordHandler;
