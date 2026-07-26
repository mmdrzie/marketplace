import type { AttachmentResult } from '../../entities/value-objects/AttachmentResult.js';

export interface AttachmentPipeline {
  process(file: Buffer, filename: string, mimeType: string): Promise<AttachmentResult>;
}
