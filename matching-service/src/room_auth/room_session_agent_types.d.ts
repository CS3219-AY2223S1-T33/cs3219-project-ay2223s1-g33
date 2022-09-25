declare interface IRoomSessionAgent {
  createToken(roomId: string, difficulty: number): string;
  verifyToken(token: string): Promise<string | undefined>;
}
declare type TokenRoomLoad = {
  difficulty: number;
  room_id: string;
};

export {
  IRoomSessionAgent,
  TokenRoomLoad,
};
