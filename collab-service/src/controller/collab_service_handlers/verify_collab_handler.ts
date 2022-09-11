import {
  VerifyRoomRequest,
  VerifyRoomResponse,
  VerifyRoomErrorCode
} from '../../proto/collab-service';
import { IApiHandler } from '../../api_server/api_server_types';
import {
  IAuthenticationAgent,
  TokenPayload,
  TokenUserData
} from "../../auth/authentication_agent_types";
import { verify } from "jsonwebtoken";

class VerifyCollabHandler implements IApiHandler<VerifyRoomRequest, VerifyRoomResponse> {
  roomSecret: string;
  authService: IAuthenticationAgent;

  constructor(jwt_session_secret: string, authService: IAuthenticationAgent) {
    this.roomSecret = jwt_session_secret;
    this.authService = authService;
  }

  async verifyRoom(token: string): Promise<TokenUserData | undefined> {
    try {
      const decoded = <TokenPayload>verify(token, this.roomSecret);
      return decoded.user;
    } catch {
      return undefined;
    }
  }

  async handle(request: VerifyRoomRequest): Promise<VerifyRoomResponse> {
    const tokenData = await this.authService.verifyToken(request.sessionToken);
    if (tokenData === undefined) {
      return VerifyCollabHandler.buildErrorResponse(
        'Invalid token',
        VerifyRoomErrorCode.VERIFY_ROOM_UNAUTHORIZED
      );
    }

    // Validate legitimate room token
    const roomData = await this.verifyRoom(request.roomToken);
    if (roomData === undefined) {
      return VerifyCollabHandler.buildErrorResponse(
        'Invalid room',
        VerifyRoomErrorCode.VERIFY_ROOM_BAD_REQUEST
      );
    }
    return VerifyCollabHandler.buildErrorResponse(
      'Good room',
      VerifyRoomErrorCode.VERIFY_ROOM_ERROR_NONE
    );
  }

  static buildErrorResponse(errorMessage: string, errorCode: VerifyRoomErrorCode): VerifyRoomResponse {
    return {
      errorMessage,
      errorCode
    };
  }
}

export default VerifyCollabHandler;
