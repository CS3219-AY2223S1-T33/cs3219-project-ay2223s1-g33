import { CreateUserRequest, CreateUserResponse } from '../../proto/user-crud-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IStorage, IUserStore } from '../../storage/storage';
import {
  convertPasswordUserToStoredUser,
  convertStoredUserToPasswordUser,
} from '../../model/user_helper';
import { StoredUser } from '../../model/user_store_model';

function getHeaderlessResponse(resp: CreateUserResponse): ApiResponse<CreateUserResponse> {
  return {
    response: resp,
    headers: {},
  };
}

class CreateUserHandler implements IApiHandler<CreateUserRequest, CreateUserResponse> {
  userStore: IUserStore;

  constructor(storage: IStorage) {
    this.userStore = storage.getUserStore();
  }

  async handle(request: ApiRequest<CreateUserRequest>): Promise<ApiResponse<CreateUserResponse>> {
    const requestObject = request.request;
    if (!requestObject.user) {
      return getHeaderlessResponse({
        user: undefined,
        errorMessage: 'Invalid user information',
      });
    }

    const userModel = convertPasswordUserToStoredUser(requestObject.user);
    if (!userModel) {
      return getHeaderlessResponse({
        user: undefined,
        errorMessage: 'Invalid user information',
      });
    }

    let user: StoredUser | undefined;
    try {
      user = await this.userStore.addUser(userModel);
    } catch (err) {
      return getHeaderlessResponse({
        user: undefined,
        errorMessage: `${err}`,
      });
    }

    const resultUserModel = convertStoredUserToPasswordUser(user);

    return getHeaderlessResponse({
      user: resultUserModel,
      errorMessage: '',
    });
  }
}

export default CreateUserHandler;
