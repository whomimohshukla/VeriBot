import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from './environment';

export const s3Client = new S3Client({
  region: env.AWS_REGION,
  endpoint: env.AWS_S3_ENDPOINT || undefined,
  credentials:
    env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY
      ? {
          accessKeyId: env.AWS_ACCESS_KEY_ID,
          secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
        }
      : undefined,
});

export const s3Bucket = env.AWS_S3_BUCKET;

export { PutObjectCommand, GetObjectCommand, DeleteObjectCommand, getSignedUrl };

export type S3Config = typeof s3Client;
