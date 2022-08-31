import { GetUserRequest, GetUserResponse } from '../../proto/user-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IUserStore } from '../../storage/storage.d';
import { convertStoredUserToPasswordUser } from '../../model/user_helper';

class GetUserHandler implements IApiHandler<GetUserRequest, GetUserResponse> {
  userStore: IUserStore;

  constructor(storage: IStorage) {
    this.userStore = storage.getUserStore();
  }

  handle(request: GetUserRequest): GetUserResponse {
    if (request.user) {
      if (request.user.username !== '') {
        const user = this.userStore.getUserByUsername(request.user.username);
        return {
          user: convertStoredUserToPasswordUser(user),
          errorMessage: '',
        };
      }

      if (request.user.userId > 0) {
        const user = this.userStore.getUser(request.user.userId);
        return {
          user: convertStoredUserToPasswordUser(user),
          errorMessage: '',
        };
      }
    }

    return {
      user: undefined,
      errorMessage: 'Malformed request',
    };
  }
}

export default GetUserHandler;
