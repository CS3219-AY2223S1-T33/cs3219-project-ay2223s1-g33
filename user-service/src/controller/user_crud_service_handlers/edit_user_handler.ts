import { EditUserRequest, EditUserResponse } from '../../proto/user-crud-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IStorage, IUserStore } from '../../storage/storage';
import { convertPasswordUserToStoredUser } from '../../model/user_helper';

function getHeaderlessResponse(resp: EditUserResponse): ApiResponse<EditUserResponse> {
  return {
    response: resp,
    headers: {},
  };
}

class EditUserHandler implements IApiHandler<EditUserRequest, EditUserResponse> {
  userStore: IUserStore;

  constructor(storage: IStorage) {
    this.userStore = storage.getUserStore();
  }

  async handle(request: ApiRequest<EditUserRequest>): Promise<ApiResponse<EditUserResponse>> {
    const requestObject = request.request;
    if (!requestObject.user || !requestObject.user.userInfo) {
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

    if (userModel.userId === 0
      || userModel.password.length === 0
      || userModel.nickname.length === 0
      || userModel.username.length === 0) {
      return getHeaderlessResponse({
        user: undefined,
        errorMessage: 'Invalid user information',
      });
    }

    try {
      await this.userStore.replaceUser(userModel);
    } catch (err) {
      return getHeaderlessResponse({
        user: undefined,
        errorMessage: `${err}`,
      });
    }

    return getHeaderlessResponse({
      user: requestObject.user,
      errorMessage: '',
    });
  }
}

export default EditUserHandler;
