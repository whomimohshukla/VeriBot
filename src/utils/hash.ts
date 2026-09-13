import { createHash, randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export const hashToken = (token: string): string => {
  return createHash('sha256').update(token).digest('hex');
};

export const generateRandomToken = (bytes = 32): string => {
  return createHash('sha256').update(randomBytes(bytes)).digest('hex');
};
