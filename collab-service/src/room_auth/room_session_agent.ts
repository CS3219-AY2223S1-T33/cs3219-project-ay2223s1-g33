import { sign, verify } from 'jsonwebtoken';
import {
  IRoomSessionAgent,
} from './room_session_agent_types';
import { TokenRoomLoad } from '../auth/authentication_agent_types';

class RoomSessionAgent implements IRoomSessionAgent {
  roomSecret: string;

  constructor(roomSecret: string) {
    this.roomSecret = roomSecret;
  }

  createToken(queueToken: string): string {
    const payload: TokenRoomLoad = {
      room_id: queueToken,
    };
    return sign(payload, this.roomSecret);
  }

  async verifyToken(token: string): Promise<string | undefined> {
    try {
      const decoded = <TokenRoomLoad> verify(token, this.roomSecret);
      return decoded.room_id;
    } catch {
      return undefined;
    }
  }
}

function createRoomSessionService(
  roomSecret: string,
): IRoomSessionAgent {
  return new RoomSessionAgent(roomSecret);
}

export default createRoomSessionService;
