import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { env } from '../config/environment';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(env.ENCRYPTION_KEY, 'hex');

export interface EncryptedPayload {
  iv: string;
  tag: string;
  data: string;
}

const assertKeyLength = (): void => {
  if (KEY.length !== 32) {
    throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
  }
};

export const encrypt = (value: string): string => {
  assertKeyLength();
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, KEY, iv);
  const encrypted = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  const payload: EncryptedPayload = {
    iv: iv.toString('hex'),
    tag: tag.toString('hex'),
    data: encrypted.toString('hex'),
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
};

export const decrypt = (value: string): string => {
  assertKeyLength();
  const parsed = JSON.parse(Buffer.from(value, 'base64').toString('utf8')) as EncryptedPayload;
  const decipher = createDecipheriv(ALGORITHM, KEY, Buffer.from(parsed.iv, 'hex'));
  decipher.setAuthTag(Buffer.from(parsed.tag, 'hex'));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(parsed.data, 'hex')), decipher.final()]);
  return decrypted.toString('utf8');
};
