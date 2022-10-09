declare interface IHashAgent {
  validatePassword(password: string, storedPassword: string): Promise<boolean>;
  hashPassword(password: string): Promise<string>;
}

export default IHashAgent;
