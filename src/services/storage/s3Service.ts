import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  s3Client,
  s3Bucket,
  getSignedUrl,
} from '../../config/aws';
import { logger } from '../../config/logger';
import { generateId } from '../../utils/helpers';

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  contentType: string;
}

export interface S3Object {
  body: Buffer;
  contentType?: string;
}

const objectUrl = (key: string): string => {
  return `https://${s3Bucket}.s3.amazonaws.com/${key}`;
};

export const s3Service = {
  async uploadBuffer(buffer: Buffer, options: { prefix?: string; contentType?: string; extension?: string } = {}): Promise<UploadResult> {
    const key = options.prefix
      ? `${options.prefix}/${generateId()}${options.extension ?? ''}`
      : `${generateId()}${options.extension ?? ''}`;
    const contentType = options.contentType ?? 'application/octet-stream';

    await s3Client.send(
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    );

    return { key, url: objectUrl(key), size: buffer.byteLength, contentType };
  },

  async uploadFile(path: string, buffer: Buffer, options: { prefix?: string; contentType?: string; extension?: string } = {}): Promise<UploadResult> {
    const name = path.split('/').pop() ?? 'file';
    const result = await s3Service.uploadBuffer(buffer, {
      prefix: options.prefix,
      contentType: options.contentType,
      extension: options.extension ?? name.includes('.') ? `.${name.split('.').pop()}` : '',
    });
    return result;
  },

  async getObject(key: string): Promise<S3Object | null> {
    try {
      const result = await s3Client.send(
        new GetObjectCommand({ Bucket: s3Bucket, Key: key })
      );
      const body = await result.Body?.transformToByteArray();
      if (!body) return null;
      return { body: Buffer.from(body), contentType: result.ContentType };
    } catch {
      return null;
    }
  },

  async deleteObject(key: string): Promise<void> {
    await s3Client.send(new DeleteObjectCommand({ Bucket: s3Bucket, Key: key }));
  },

  async getSignedDownloadUrl(key: string, expiresInSeconds = 3600): Promise<string> {
    return getSignedUrl(
      s3Client,
      new GetObjectCommand({ Bucket: s3Bucket, Key: key }),
      { expiresIn: expiresInSeconds }
    );
  },

  async getSignedUploadUrl(key: string, contentType: string, expiresInSeconds = 600): Promise<string> {
    return getSignedUrl(
      s3Client,
      new PutObjectCommand({
        Bucket: s3Bucket,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: expiresInSeconds }
    );
  },

  async isConfigured(): Promise<boolean> {
    const { env } = await import('../../config/environment');
    return Boolean(env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY);
  },

  logger,
};