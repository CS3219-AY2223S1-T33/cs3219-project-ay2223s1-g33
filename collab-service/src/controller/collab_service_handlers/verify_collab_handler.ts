import { verify } from 'jsonwebtoken';
import {
  VerifyRoomRequest,
  VerifyRoomResponse,
  VerifyRoomErrorCode,
} from '../../proto/collab-service';
import { IApiHandler } from '../../api_server/api_server_types';
import {
  IAuthenticationAgent,
  TokenRoomLoad,
} from '../../auth/authentication_agent_types';

class VerifyCollabHandler implements
  IApiHandler<VerifyRoomRequest, VerifyRoomResponse> {
  roomSecret: string;

  authService: IAuthenticationAgent;

  constructor(jwt_room_secret: string, authService: IAuthenticationAgent) {
    this.roomSecret = jwt_room_secret;
    this.authService = authService;
  }

  async handle(request: VerifyRoomRequest): Promise<VerifyRoomResponse> {
    const tokenData = await this.authService.verifyToken(request.sessionToken);
    if (tokenData === undefined) {
      return VerifyCollabHandler.buildErrorResponse(
        'Invalid token',
        VerifyRoomErrorCode.VERIFY_ROOM_UNAUTHORIZED,
      );
    }

    // Validate legitimate room token
    const roomData = await this.verifyRoom(request.roomToken);
    if (roomData === undefined) {
      return VerifyCollabHandler.buildErrorResponse(
        'Invalid room',
        VerifyRoomErrorCode.VERIFY_ROOM_BAD_REQUEST,
      );
    }
    return VerifyCollabHandler.buildErrorResponse(
      'Good room',
      VerifyRoomErrorCode.VERIFY_ROOM_ERROR_NONE,
    );
  }

  async verifyRoom(token: string): Promise<string | undefined> {
    try {
      const decoded = <TokenRoomLoad> verify(token, this.roomSecret);
      return decoded.room_id;
    } catch {
      return undefined;
    }
  }

  static buildErrorResponse(errorMessage: string, errorCode: VerifyRoomErrorCode):
  VerifyRoomResponse {
    return {
      errorMessage,
      errorCode,
    };
  }
}

export default VerifyCollabHandler;
