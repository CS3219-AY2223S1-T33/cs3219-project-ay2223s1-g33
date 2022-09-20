import { GetUserRequest, GetUserResponse } from '../../proto/user-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IStorage, IUserStore } from '../../storage/storage.d';
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
    if (requestObject.user) {
      if (requestObject.user.username !== '') {
        const user = await this.userStore.getUserByUsername(requestObject.user.username);
        return getHeaderlessResponse({
          user: convertStoredUserToPasswordUser(user),
          errorMessage: '',
        });
      }

      if (requestObject.user.userId > 0) {
        const user = await this.userStore.getUser(requestObject.user.userId);
        return getHeaderlessResponse({
          user: convertStoredUserToPasswordUser(user),
          errorMessage: '',
        });
      }
    }

    return getHeaderlessResponse({
      user: undefined,
      errorMessage: 'Malformed request',
    });
  }
}

export default GetUserHandler;
