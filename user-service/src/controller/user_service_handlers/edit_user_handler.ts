import { EditUserRequest, EditUserResponse } from '../../proto/user-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IStorage, IUserStore } from '../../storage/storage.d';
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
