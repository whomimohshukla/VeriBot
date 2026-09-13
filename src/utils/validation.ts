import { ZodType, ZodError } from 'zod';
import { ValidationError } from './errors';
import { ErrorCodes } from '../constants/errorCodes';

export const validateSchema = <T>(schema: ZodType<T>, data: unknown): T => {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ValidationError(ErrorCodes.VALIDATION_ERROR, 'Validation failed', formatZodError(result.error));
  }
  return result.data;
};

export const formatZodError = (error: ZodError): Record<string, string[]> => {
  const formatted: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const path = issue.path.join('.') || 'root';
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(issue.message);
  }
  return formatted;
};
