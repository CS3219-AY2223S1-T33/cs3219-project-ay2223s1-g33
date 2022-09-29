import { sign } from 'jsonwebtoken';
import createRoomSessionService from '../../../src/room_auth/room_session_agent';

describe('Function-Room-Auth RoomSessionAgent', () => {
  const key = 'randomKey';
  it(' Test Wrong Room Payload JWT', () => {
    const agent = createRoomSessionService(key);
    const wrongToken = 'randomToken';
    agent.verifyToken(wrongToken).then((res) => {
      expect(res).toBe(undefined);
    });
  });
  it(' Test Correct Room Payload JWT', () => {
    const agent = createRoomSessionService(key);
    const payload = {
      difficulty: 1,
      room_id: 2,
    };
    const correctToken = sign(payload, key);
    agent.verifyToken(correctToken).then((res) => {
      expect(res?.difficulty).toBe(payload.difficulty);
      expect(res?.roomId).toBe(payload.room_id);
    });
  });
});
