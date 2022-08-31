import { EditUserRequest, EditUserResponse } from '../../proto/user-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IUserStore } from '../../storage/storage.d';
import { convertPasswordUserToStoredUser } from '../../model/user_helper';

class EditUserHandler implements IApiHandler<EditUserRequest, EditUserResponse> {
  userStore: IUserStore;

  constructor(storage: IStorage) {
    this.userStore = storage.getUserStore();
  }

  handle(request: EditUserRequest): EditUserResponse {
    if (!request.user) {
      return {
        user: undefined,
        errorMessage: 'Invalid user information',
      };
    }

    const userModel = convertPasswordUserToStoredUser(request.user);
    if (!userModel) {
      return {
        user: undefined,
        errorMessage: 'Invalid user information',
      };
    }

    try {
      this.userStore.replaceUser(userModel);
    } catch (err) {
      return {
        user: undefined,
        errorMessage: `${err}`,
      };
    }

    return {
      user: request.user,
      errorMessage: '',
    };
  }
}

export default EditUserHandler;
