import crypto from 'crypto';
import { promisify } from 'util';
import { readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { Secret } from '~/server/db';
import { secretMasterKeyFile } from '~/server/settings';

// Promisify crypto functions
const randomBytes = promisify(crypto.randomBytes);
interface StoreSecretParams {
  secretKey: string;
  secretValue: string;
}

export class SecretService {
  private readonly encryptionKey: Buffer;
  private readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';
  private readonly KEY_LENGTH = 32;
  private readonly SALT = Buffer.from('70kdUT7w>rUD9i&0');

  static async loadMasterKey() {
    if (!existsSync(secretMasterKeyFile)) {
      console.log('generate key');
      const key = crypto.randomBytes(32).toString('base64');
      await writeFile(secretMasterKeyFile, key);
      await Secret.destroy({ where: {} });
      return key;
    } else {
      const key = await readFile(secretMasterKeyFile, 'utf8');
      return key;
    }
  }

  constructor(masterKey: string) {
    this.encryptionKey = this.deriveKey(masterKey);
  }

  private deriveKey(masterKey: string): Buffer {
    // Derive a key using PBKDF2
    return crypto.pbkdf2Sync(
      masterKey,
      this.SALT,
      100000, // iterations
      this.KEY_LENGTH,
      'sha256'
    );
  }

  private async encrypt(
    data: string
  ): Promise<{ encryptedData: string; iv: string }> {
    // Generate a random IV
    const iv = await randomBytes(16);

    // Create cipher
    const cipher = crypto.createCipheriv(
      this.ENCRYPTION_ALGORITHM,
      this.encryptionKey,
      iv
    );

    // Encrypt the data
    let encryptedData = cipher.update(data, 'utf8', 'base64');
    encryptedData += cipher.final('base64');

    // Get the auth tag
    const authTag = cipher.getAuthTag();

    // Combine the encrypted data and auth tag
    const finalData = encryptedData + '.' + authTag.toString('base64');

    return {
      encryptedData: finalData,
      iv: iv.toString('base64'),
    };
  }

  private async decrypt(encryptedData: string, iv: string): Promise<string> {
    try {
      // Split the data and auth tag
      const [data, authTag] = encryptedData.split('.');

      // Create decipher
      const decipher = crypto.createDecipheriv(
        this.ENCRYPTION_ALGORITHM,
        this.encryptionKey,
        Buffer.from(iv, 'base64')
      );

      // Set auth tag
      decipher.setAuthTag(Buffer.from(authTag, 'base64'));

      // Decrypt the data
      let decrypted = decipher.update(data, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('Decryption failed');
    }
  }

  async storeSecret({ secretKey, secretValue }: StoreSecretParams) {
    const { encryptedData, iv } = await this.encrypt(secretValue);

    await Secret.upsert({
      secretKey,
      encryptedValue: encryptedData,
      iv: iv,
    });
  }

  async getSecret(secretKey: string): Promise<string | null> {
    const secret = await Secret.findOne({
      where: { secretKey },
      limit: 1,
    });

    if (!secret) {
      return null;
    }

    return await this.decrypt(secret.encryptedValue, secret.iv);
  }

  async deleteSecret(secretKey: string): Promise<boolean> {
    const deleted = await Secret.destroy({
      where: { secretKey },
    });

    return deleted > 0;
  }
}
