declare interface IAuthenticationAgent {
  createToken(payload: Object): Promise<TokenPair>;
  invalidateToken(token: TokenPair): Promise<boolean>;
}

declare type TokenUserData = {
  username: string;
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
