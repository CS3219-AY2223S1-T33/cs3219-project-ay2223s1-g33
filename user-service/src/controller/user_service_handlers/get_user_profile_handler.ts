import { GetUserProfileRequest, GetUserProfileResponse } from '../../proto/user-service';
import {
  IApiHandler,
  ApiRequest,
  ApiResponse,
  ILoopbackServiceChannel,
} from '../../api_server/api_server_types';
import { PasswordUser, User } from '../../proto/types';
import { IAuthenticationAgent } from '../../auth/authentication_agent_types';
import { IUserCrudService } from '../../proto/user-crud-service.grpc-server';
import { GetUserRequest, GetUserResponse } from '../../proto/user-crud-service';

function getHeaderlessResponse(resp: GetUserProfileResponse): ApiResponse<GetUserProfileResponse> {
  return {
    response: resp,
    headers: {},
  };
}

const gatewayHeaderUsername = 'grpc-x-bearer-username';

class GetUserProfileHandler implements IApiHandler<GetUserProfileRequest, GetUserProfileResponse> {
  rpcClient: ILoopbackServiceChannel<IUserCrudService>;

  authService: IAuthenticationAgent;

  constructor(
    rpcClient: ILoopbackServiceChannel<IUserCrudService>,
    authService: IAuthenticationAgent,
  ) {
    this.rpcClient = rpcClient;
    this.authService = authService;
  }

  async handle(request: ApiRequest<GetUserProfileRequest>)
    : Promise<ApiResponse<GetUserProfileResponse>> {
    if (!(gatewayHeaderUsername in request.headers)) {
      return GetUserProfileHandler.buildErrorResponse('Bad request from gateway');
    }

    const username = request.headers[gatewayHeaderUsername][0];

    const user = await this.getUserByUsername(username);
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
