import { GetUserProfileRequest, GetUserProfileResponse } from '../../proto/user-bff-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { UserServiceClient } from '../../proto/user-service.grpc-client';
import { PasswordUser, User } from '../../proto/types';
import { IAuthenticationAgent } from '../../auth/authentication_agent_types';

function getHeaderlessResponse(resp: GetUserProfileResponse): ApiResponse<GetUserProfileResponse> {
  return {
    response: resp,
    headers: {},
  };
}

const gatewayHeaderUsername = 'grpc-x-bearer-username';

class GetUserProfileHandler implements IApiHandler<GetUserProfileRequest, GetUserProfileResponse> {
  rpcClient: UserServiceClient;

  authService: IAuthenticationAgent;

  constructor(rpcClient: UserServiceClient, authService: IAuthenticationAgent) {
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

  getUserByUsername(username: string): Promise<(PasswordUser | undefined)> {
    const searchUserObject: User = User.create();
    searchUserObject.username = username;

    return new Promise<(PasswordUser | undefined)>((resolve, reject) => {
      this.rpcClient.getUser({
        user: searchUserObject,
      }, (err, value) => {
        if (!value) {
          reject(err);
          return;
        }

        if (!value.user && value.errorMessage !== '') {
          reject(value.errorMessage);
          return;
        }
        resolve(value.user);
      });
    });
  }

  static buildErrorResponse(errorMessage: string): ApiResponse<GetUserProfileResponse> {
    return getHeaderlessResponse({
      errorMessage,
    });
  }
}

export default GetUserProfileHandler;
