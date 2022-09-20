declare interface IAuthenticationAgent {
  createToken(payload: Object): Promise<string>;
  invalidateToken(token: string): Promise<boolean>;
}

declare type TokenUserData = {
  username: string;
};

export {
  IAuthenticationAgent,
  TokenUserData,
};
