declare interface IRoomSessionAgent {
  verifyToken(token: string): Promise<{ difficulty: number; roomId: string } | undefined>;
}

declare type TokenRoomLoad = {
  difficulty: number;
  room_id: string;
};

export {
  IRoomSessionAgent,
  TokenRoomLoad,
};
