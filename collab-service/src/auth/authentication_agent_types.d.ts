declare interface IAuthenticationAgent {
  createToken(payload: Object): string;
  verifyToken(token: string): Promise<TokenUserData | undefined>;
  invalidateToken(token: string): Promise<boolean>;
}

declare interface ITokenBlacklist {
  addToken(token: string): Promise<boolean>;
  isTokenBlacklisted(token: string): Promise<boolean>;
  removeToken(token: string): Promise<boolean>;
}

declare type TokenUserData = {
  username: string;
};

declare type TokenPayload = {
  user: TokenUserData;
};

declare type TokenRoomLoad = {
  room_id: string;
};

export {
  IAuthenticationAgent,
  ITokenBlacklist,
  TokenUserData,
  TokenPayload,
  TokenRoomLoad,
};
