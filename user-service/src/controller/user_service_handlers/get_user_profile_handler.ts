import { GetUserProfileRequest, GetUserProfileResponse } from '../../proto/user-service';
import {
  IApiHandler,
  ApiRequest,
  ApiResponse,
  ILoopbackServiceChannel,
} from '../../api_server/api_server_types';
import { PasswordUser, User } from '../../proto/types';
import { IUserCrudService } from '../../proto/user-crud-service.grpc-server';
import { GetUserRequest, GetUserResponse } from '../../proto/user-crud-service';
import GatewayConstants from '../../utils/gateway_constants';

function getHeaderlessResponse(resp: GetUserProfileResponse): ApiResponse<GetUserProfileResponse> {
  return {
    response: resp,
    headers: {},
  };
}

class GetUserProfileHandler implements IApiHandler<GetUserProfileRequest, GetUserProfileResponse> {
  rpcClient: ILoopbackServiceChannel<IUserCrudService>;

  constructor(
    rpcClient: ILoopbackServiceChannel<IUserCrudService>,
  ) {
    this.rpcClient = rpcClient;
  }

  async handle(request: ApiRequest<GetUserProfileRequest>)
    : Promise<ApiResponse<GetUserProfileResponse>> {
    if (!(GatewayConstants.GATEWAY_HEADER_USERNAME in request.headers)) {
      return GetUserProfileHandler.buildErrorResponse('Bad request from gateway');
    }

    const username = request.headers[GatewayConstants.GATEWAY_HEADER_USERNAME][0];
    if (username.length === 0) {
      return GetUserProfileHandler.buildErrorResponse('Bad request from gateway');
    }

    let user: (PasswordUser | undefined);
    try {
      user = await this.getUserByUsername(username);
    } catch {
      return GetUserProfileHandler.buildErrorResponse(
        'Cannot contact downstream',
      );
    }

    if (!user) {
      return GetUserProfileHandler.buildErrorResponse(
        'Internal Server Error',
      );
    }

    return getHeaderlessResponse({
      user: user.userInfo,
      errorMessage: '',
    });
  }

  async getUserByUsername(username: string): Promise<(PasswordUser | undefined)> {
    const searchUserObject: User = User.create();
    searchUserObject.username = username;

    const request: GetUserRequest = {
      user: searchUserObject,
    };

    const result = await this.rpcClient.callRoute<GetUserRequest, GetUserResponse>('getUser', request, GetUserResponse);
    if (!result) {
      return undefined;
    }

    if (!result.user && result.errorMessage !== '') {
      throw new Error(result.errorMessage);
    }

    return result.user;
  }

  static buildErrorResponse(errorMessage: string): ApiResponse<GetUserProfileResponse> {
    return getHeaderlessResponse({
      errorMessage,
    });
  }
}

export default GetUserProfileHandler;
