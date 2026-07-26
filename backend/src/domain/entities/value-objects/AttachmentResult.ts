import { createHash } from 'crypto';

export class AttachmentResult {
  private constructor(
    public readonly url: string,
    public readonly thumbnailUrl: string | null,
    public readonly virusScan: 'clean' | 'infected' | 'skipped',
    public readonly ocrText: string | null,
    public readonly metadata: Record<string, unknown>,
    public readonly previewUrl: string | null,
    public readonly contentHash: string,
    public readonly fileSize: number,
  ) {}

  static uploaded(url: string, fileSize: number, contentHash: string): AttachmentResult {
    return new AttachmentResult(url, null, 'skipped', null, {}, null, contentHash, fileSize);
  }

  static fromBuffer(url: string, buffer: Buffer): AttachmentResult {
    const hash = createHash('sha256').update(buffer).digest('hex');
    return new AttachmentResult(url, null, 'skipped', null, {}, null, hash, buffer.length);
  }
}
