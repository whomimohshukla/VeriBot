import fs from 'fs';
import path from 'path';
import { generateId } from '../../utils/helpers';
import { s3Service, type UploadResult } from './s3Service';

export type FileKind = 'screenshot' | 'video' | 'attachment' | 'trace' | 'report';

export const fileService = {
  async storeBuffer(
    kind: FileKind,
    buffer: Buffer,
    options: { contentType?: string; extension?: string; actorId?: string } = {}
  ): Promise<UploadResult> {
    if (await s3Service.isConfigured()) {
      return s3Service.uploadBuffer(buffer, {
        prefix: `${kind}${options.actorId ? `/${options.actorId}` : ''}`,
        contentType: options.contentType,
        extension: options.extension,
      });
    }
    return storeLocally(kind, buffer, options);
  },

  async remove(key: string): Promise<void> {
    if (await s3Service.isConfigured()) {
      await s3Service.deleteObject(key);
      return;
    }
    try {
      const localPath = path.resolve(process.cwd(), 'storage', key);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
      }
    } catch {
      return;
    }
  },
};

const storeLocally = (
  kind: FileKind,
  buffer: Buffer,
  options: { contentType?: string; extension?: string; actorId?: string } = {}
): UploadResult => {
  const dir = path.resolve(process.cwd(), 'storage', kind, options.actorId ?? 'anonymous');
  fs.mkdirSync(dir, { recursive: true });
  const extension = options.extension ?? inferExtension(options.contentType);
  const filename = `${generateId()}${extension}`;
  const absolute = path.join(dir, filename);
  fs.writeFileSync(absolute, buffer);
  const key = path.relative(path.resolve(process.cwd(), 'storage'), absolute);
  return {
    key,
    url: `/storage/${key}`,
    size: buffer.byteLength,
    contentType: options.contentType ?? 'application/octet-stream',
  };
};

const inferExtension = (contentType?: string): string => {
  if (!contentType) return '';
  switch (contentType) {
    case 'image/png':
      return '.png';
    case 'image/jpeg':
      return '.jpg';
    case 'text/html':
      return '.html';
    default:
      return '';
  }
};
