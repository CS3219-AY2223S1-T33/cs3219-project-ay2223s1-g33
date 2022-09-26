import { verify } from 'jsonwebtoken';
import { IRoomSessionAgent, TokenRoomLoad } from './room_session_agent_types';

class RoomSessionAgent implements IRoomSessionAgent {
  roomSecret: string;

  constructor(roomSecret: string) {
    this.roomSecret = roomSecret;
  }

  async verifyToken(token: string): Promise<{ difficulty: number; roomId: string } | undefined> {
    try {
      const decoded = <TokenRoomLoad> verify(token, this.roomSecret);
      return {
        difficulty: decoded.difficulty,
        roomId: decoded.room_id,
      };
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
