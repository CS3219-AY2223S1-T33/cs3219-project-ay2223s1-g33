export declare interface IAuthenticationService {
  createToken(payload: Object): string;
  verifyToken(token: string): boolean;
}
