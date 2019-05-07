import * as bcrypt from 'bcrypt';

export class Hash {
  private static defaultSaltRounds = 10;

  static async getHash(value: string | undefined): Promise<string> {
    return bcrypt.hash(value, this.defaultSaltRounds);
  }

  static async compareHash(value: string | undefined, hash: string | undefined): Promise<boolean> {
    return bcrypt.compare(value, hash);
  }
}
