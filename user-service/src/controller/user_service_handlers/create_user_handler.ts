import { CreateUserRequest, CreateUserResponse } from '../../proto/user-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IUserStore } from '../../storage/storage.d';
import {
  convertPasswordUserToStoredUser,
  convertStoredUserToPasswordUser,
} from '../../model/user_helper';
import { StoredUser } from '../../model/user_store_model';

class CreateUserHandler implements IApiHandler<CreateUserRequest, CreateUserResponse> {
  userStore: IUserStore;

  constructor(storage: IStorage) {
    this.userStore = storage.getUserStore();
  }

  async handle(request: CreateUserRequest): Promise<CreateUserResponse> {
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

    let user: StoredUser | undefined;
    try {
      user = this.userStore.addUser(userModel);
    } catch (err) {
      return {
        user: undefined,
        errorMessage: `${err}`,
      };
    }

    const resultUserModel = convertStoredUserToPasswordUser(user);

    return {
      user: resultUserModel,
      errorMessage: '',
    };
  }
}

export default CreateUserHandler;
