import bcrypt from 'bcrypt';
import IHashAgent from './hash_agent_types.d';

class HashAgent implements IHashAgent {
  // eslint-disable-next-line class-methods-use-this
  async validatePassword(password: string, storedPassword: string): Promise<boolean> {
    const result = await bcrypt.compare(password, storedPassword);
    return result;
  }

  // eslint-disable-next-line class-methods-use-this
  async hashPassword(password: string): Promise<string> {
    const result = await bcrypt.hash(password, 8);
    return result;
  }
}

export default function createHashAgent(): IHashAgent {
  return new HashAgent();
}
