import { GetUserRequest, GetUserResponse } from '../../proto/user-crud-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IStorage, IUserStore } from '../../storage/storage';
import { convertStoredUserToPasswordUser } from '../../model/user_helper';

function getHeaderlessResponse(resp: GetUserResponse): ApiResponse<GetUserResponse> {
  return {
    response: resp,
    headers: {},
  };
}

class GetUserHandler implements IApiHandler<GetUserRequest, GetUserResponse> {
  userStore: IUserStore;

  constructor(storage: IStorage) {
    this.userStore = storage.getUserStore();
  }

  async handle(request: ApiRequest<GetUserRequest>): Promise<ApiResponse<GetUserResponse>> {
    const requestObject = request.request;

    if (!requestObject.user) {
      return getHeaderlessResponse({
        user: undefined,
        errorMessage: 'Malformed request 1',
      });
    }

    const hasUsername = requestObject.user.username !== '';
    const hasId = requestObject.user.userId > 0;

    if ((!hasUsername && !hasId) || (hasUsername && hasId)) {
      return getHeaderlessResponse({
        user: undefined,
        errorMessage: 'Malformed request 2',
      });
    }

    let user;
    try {
      if (hasUsername) {
        user = await this.userStore.getUserByUsername(requestObject.user.username);
      } else if (hasId) {
        user = await this.userStore.getUser(requestObject.user.userId);
      }
    } catch {
      return getHeaderlessResponse({
        user: undefined,
        errorMessage: 'Database Error',
      });
    }

    if (!user) {
      return getHeaderlessResponse({
        user: undefined,
        errorMessage: 'Internal Error',
      });
    }

    return getHeaderlessResponse({
      user: convertStoredUserToPasswordUser(user),
      errorMessage: '',
    });
  }
}

export default GetUserHandler;
