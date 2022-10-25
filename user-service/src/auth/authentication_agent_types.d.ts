declare interface IAuthenticationAgent {
  createToken(payload: Object): Promise<TokenPair>;
  invalidateToken(token: TokenPair): Promise<boolean>;
  invalidateTokensBeforeTime(username: string, timestamp: number): Promise<void>;
}

declare type TokenUserData = {
  username: string;
  nickname: string;
};

declare type TokenPair = {
  sessionToken: string;
  refreshToken: string;
};

export {
  IAuthenticationAgent,
  TokenUserData,
  TokenPair,
};
