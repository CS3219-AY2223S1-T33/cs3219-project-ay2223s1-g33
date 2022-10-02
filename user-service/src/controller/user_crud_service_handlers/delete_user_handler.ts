import { DeleteUserRequest, DeleteUserResponse } from '../../proto/user-crud-service';
import { IApiHandler, ApiRequest, ApiResponse } from '../../api_server/api_server_types';
import { IStorage, IUserStore } from '../../storage/storage';

function getHeaderlessResponse(resp: DeleteUserResponse): ApiResponse<DeleteUserResponse> {
  return {
    response: resp,
    headers: {},
  };
}

class DeleteUserHandler implements IApiHandler<DeleteUserRequest, DeleteUserResponse> {
  userStore: IUserStore;

  constructor(storage: IStorage) {
    this.userStore = storage.getUserStore();
  }

  async handle(request: ApiRequest<DeleteUserRequest>): Promise<ApiResponse<DeleteUserResponse>> {
    const requestObject = request.request;

    if (requestObject.userId <= 0) {
      return getHeaderlessResponse({
        errorMessage: 'Malformed request',
      });
    }

    await this.userStore.removeUser(requestObject.userId);

    return getHeaderlessResponse({
      errorMessage: '',
    });
  }
}

export default DeleteUserHandler;
