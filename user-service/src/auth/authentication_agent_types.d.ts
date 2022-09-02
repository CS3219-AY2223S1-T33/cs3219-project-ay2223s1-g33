export declare interface IAuthenticationAgent {
  createToken(payload: Object): string;
  verifyToken(token: string): boolean;
}
