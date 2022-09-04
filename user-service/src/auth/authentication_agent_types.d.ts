declare interface IAuthenticationAgent {
  createToken(payload: Object): string;
  verifyToken(token: string): Promise<boolean>;
  invalidateToken(token: string): Promise<boolean>;
}

declare interface ITokenBlacklist {
  addToken(token: string): Promise<boolean>;
  isTokenBlacklisted(token: string): Promise<boolean>;
  removeToken(token: string): Promise<boolean>;
}

export {
  IAuthenticationAgent,
  ITokenBlacklist,
};
