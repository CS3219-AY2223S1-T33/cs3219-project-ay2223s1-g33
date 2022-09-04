import { GetUserRequest, GetUserResponse } from '../../proto/user-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IUserStore } from '../../storage/storage.d';
import { convertStoredUserToPasswordUser } from '../../model/user_helper';
class GetUserHandler implements IApiHandler<GetUserRequest, GetUserResponse> {
  userStore: IUserStore;

  constructor(storage: IStorage) {
    this.userStore = storage.getUserStore();
  }

  async handle(request: GetUserRequest): Promise<GetUserResponse> {
    if (request.user) {
      if (request.user.username !== '') {
        const user = await this.userStore.getUserByUsername(request.user.username);
        return {
          user: convertStoredUserToPasswordUser(await user),
          errorMessage: '',
        };
      }

      if (request.user.userId > 0) {
        const user = await this.userStore.getUser(request.user.userId);
        return {
          user: convertStoredUserToPasswordUser(await user),
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
