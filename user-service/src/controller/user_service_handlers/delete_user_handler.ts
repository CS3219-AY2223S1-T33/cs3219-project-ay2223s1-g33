import { DeleteUserRequest, DeleteUserResponse } from '../../proto/user-service';
import { IApiHandler } from '../../api_server/api_server_types';
import { IStorage, IUserStore } from '../../storage/storage.d';

class DeleteUserHandler implements IApiHandler<DeleteUserRequest, DeleteUserResponse> {
  userStore: IUserStore;

  constructor(storage: IStorage) {
    this.userStore = storage.getUserStore();
  }

  handle(request: DeleteUserRequest): DeleteUserResponse {
    if (request.userId <= 0) {
      return {
        errorMessage: 'Malformed request',
      };
    }

    this.userStore.removeUser(request.userId);

    return {
      errorMessage: '',
    };
  }
}

export default DeleteUserHandler;