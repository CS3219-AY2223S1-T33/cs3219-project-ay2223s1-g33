import Validator from 'validator';
import { ChangePasswordRequest, ChangePasswordResponse, ChangePasswordErrorCode } from '../../proto/user-service';
import {
  IApiHandler,
  ApiRequest,
  ApiResponse,
} from '../../api_server/api_server_types';
import {
  EditUserRequest,
  GetUserRequest,
} from '../../proto/user-crud-service';
import { IUserCrudService } from '../../proto/user-crud-service.grpc-server';
import { PasswordUser, User } from '../../proto/types';
import IHashAgent from '../../auth/hash_agent_types';
import { IAuthenticationAgent } from '../../auth/authentication_agent_types';
import GatewayConstants from '../../utils/gateway_constants';
import { ILoopbackServiceChannel } from '../../api_server/loopback_server_types';

class ChangePasswordHandler
implements IApiHandler<ChangePasswordRequest, ChangePasswordResponse> {
  rpcLoopback: ILoopbackServiceChannel<IUserCrudService>;

  authAgent: IAuthenticationAgent;

  hashAgent: IHashAgent;

  constructor(
    rpcLoopback: ILoopbackServiceChannel<IUserCrudService>,
    authAgent: IAuthenticationAgent,
    hashAgent: IHashAgent,
  ) {
    this.rpcLoopback = rpcLoopback;
    this.authAgent = authAgent;
    this.hashAgent = hashAgent;
  }

  async handle(request: ApiRequest<ChangePasswordRequest>):
  Promise<ApiResponse<ChangePasswordResponse>> {
    const requestObject = request.request;

    const validatedRequest = ChangePasswordHandler.validateRequest(requestObject);
    if (validatedRequest instanceof Error) {
      return ChangePasswordHandler.buildErrorResponse(
        ChangePasswordErrorCode.CHANGE_PASSWORD_ERROR_BAD_REQUEST,
        validatedRequest.message,
      );
    }

    const { newPassword } = validatedRequest;

    if (!(GatewayConstants.GATEWAY_HEADER_USERNAME in request.headers)) {
      return ChangePasswordHandler.buildErrorResponse(
        ChangePasswordErrorCode.CHANGE_PASSWORD_ERROR_INTERNAL_ERROR,
        'Bad request from gateway',
      );
    }

    const username = request.headers[GatewayConstants.GATEWAY_HEADER_USERNAME][0];
    if (username.length === 0) {
      return ChangePasswordHandler.buildErrorResponse(
        ChangePasswordErrorCode.CHANGE_PASSWORD_ERROR_INTERNAL_ERROR,
        'Bad request from gateway',
      );
    }

    const user = await this.getUserByUsername(username);
    if (!user || !user.userInfo) {
      return ChangePasswordHandler.buildErrorResponse(
        ChangePasswordErrorCode.CHANGE_PASSWORD_ERROR_INTERNAL_ERROR,
        'Could not find user',
      );
    }

    const hashedPassword = await this.hashAgent.hashPassword(newPassword);
    const isSuccessful = await this.changeUserPassword(user, hashedPassword);
    if (!isSuccessful) {
      return ChangePasswordHandler.buildErrorResponse(
        ChangePasswordErrorCode.CHANGE_PASSWORD_ERROR_INTERNAL_ERROR,
        'Could not save new password',
      );
    }

    try {
      await this.authAgent.invalidateTokensBeforeTime(
        user.userInfo.username,
        Math.floor(new Date().getTime() / 1000),
      );
    } catch {
      return ChangePasswordHandler.buildErrorResponse(
        ChangePasswordErrorCode.CHANGE_PASSWORD_ERROR_INTERNAL_ERROR,
        'Could not invalidate old tokens',
      );
    }

    return ChangePasswordHandler.buildHeaderlessResponse({
      errorCode: ChangePasswordErrorCode.CHANGE_PASSWORD_ERROR_NONE,
      errorMessage: '',
    });
  }

  static validateRequest(request: ChangePasswordRequest): (ValidatedRequest | Error) {
    if (!request.newPassword) {
      return new Error('New password not provided');
    }

    const newPassword = request.newPassword.trim();

    if (Validator.isEmpty(newPassword)) {
      return new Error('Empty field provided');
    }

    if (newPassword.length < 8) {
      return new Error('Insufficient password length');
    }

    return {
      newPassword,
    };
  }

  async getUserByUsername(username: string): Promise<(PasswordUser | undefined)> {
    const searchUserObject: User = User.create();
    searchUserObject.username = username;

    const request: GetUserRequest = {
      user: searchUserObject,
    };

    const result = await this.rpcLoopback.client.getUser(request);
    if (!result) {
      return undefined;
    }

    if (!result.user && result.errorMessage !== '') {
      throw new Error(result.errorMessage);
    }

    return result.user;
  }

  async changeUserPassword(userModel: PasswordUser, newPassword: string): Promise<boolean> {
    const newUserModel = userModel;
    newUserModel.password = newPassword;
    const editUserRequest: EditUserRequest = {
      user: newUserModel,
    };

    const updateResponse = await this.rpcLoopback.client.editUser(editUserRequest);
    return updateResponse.errorMessage === '';
  }

  static buildHeaderlessResponse(response: ChangePasswordResponse):
  ApiResponse<ChangePasswordResponse> {
    return {
      response,
      headers: {},
    };
  }

  static buildErrorResponse(errorCode: ChangePasswordErrorCode, errorMessage: string)
    : ApiResponse<ChangePasswordResponse> {
    return ChangePasswordHandler.buildHeaderlessResponse({
      errorCode,
      errorMessage,
    });
  }
}

type ValidatedRequest = {
  newPassword: string,
};

export default ChangePasswordHandler;
