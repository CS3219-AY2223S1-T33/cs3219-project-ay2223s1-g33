import { GetUserProfileRequest, GetUserProfileResponse } from '../../proto/user-bff-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { UserServiceClient } from '../../proto/user-service.grpc-client';
import { PasswordUser, User } from '../../proto/types';
import { IAuthenticationAgent } from '../../auth/authentication_agent_types';

class GetUserProfileHandler implements IApiHandler<GetUserProfileRequest, GetUserProfileResponse> {
  rpcClient: UserServiceClient;

  authService: IAuthenticationAgent;

  constructor(rpcClient: UserServiceClient, authService: IAuthenticationAgent) {
    this.rpcClient = rpcClient;
    this.authService = authService;
  }

  async handle(request: GetUserProfileRequest): Promise<GetUserProfileResponse> {
    const validatedRequest = GetUserProfileHandler.validateRequest(request);
    if (validatedRequest instanceof Error) {
      return GetUserProfileHandler.buildErrorResponse(
        validatedRequest.message,
      );
    }

    const tokenData = await this.authService.verifyToken(validatedRequest.sessionToken);
    if (tokenData === undefined) {
      return GetUserProfileHandler.buildErrorResponse(
        'Invalid token',
      );
    }

    const user = await this.getUserByUsername(tokenData.username);
    if (!user) {
      return GetUserProfileHandler.buildErrorResponse(
        'Internal Server Error',
      );
    }

    return {
      user: user.userInfo,
      errorMessage: '',
    };
  }

  static validateRequest(request: GetUserProfileRequest): (GetUserProfileRequest | Error) {
    if (!request.sessionToken) {
      return new Error('No token provided');
    }

    const sessionToken = request.sessionToken.trim();

    return {
      sessionToken,
    };
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

  static buildErrorResponse(errorMessage: string): GetUserProfileResponse {
    return {
      errorMessage,
    };
  }
}

export default GetUserProfileHandler;
