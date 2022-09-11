declare interface IRoomSessionAgent {
  createToken(payload: string): string;
  verifyToken(token: string): Promise<string | undefined>;
}
declare type TokenRoomLoad = {
  room_id: string;
};

export {
  IRoomSessionAgent,
  TokenRoomLoad,
};
