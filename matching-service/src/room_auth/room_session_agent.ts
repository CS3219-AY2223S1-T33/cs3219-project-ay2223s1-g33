import { sign, verify } from 'jsonwebtoken';
import {
  IRoomSessionAgent,
  TokenRoomLoad,
} from './room_session_agent_types';

class RoomSessionAgent implements IRoomSessionAgent {
  roomSecret: string;

  constructor(roomSecret: string) {
    this.roomSecret = roomSecret;
  }

  createToken(roomId: string, difficulty: number): string {
    const payload: TokenRoomLoad = {
      difficulty,
      room_id: roomId,
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
