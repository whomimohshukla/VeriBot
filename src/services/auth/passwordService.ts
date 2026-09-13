import bcrypt from 'bcryptjs';

const BCRYPT_ROUNDS = 12;

export const passwordService = {
  hash: async (password: string): Promise<string> => {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
  },

  verify: async (password: string, hash: string): Promise<boolean> => {
    if (!hash) return false;
    return bcrypt.compare(password, hash);
  },

  validateComplexity: (password: string): boolean => {
    return password.length >= 8;
  },
};