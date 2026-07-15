import { Hono } from 'hono';
import { auth } from '../middleware/auth.js';
import { config } from '../config/index.js';
import { AppError } from '../errors.js';

const router = new Hono();

// POST /upload/presigned — generate presigned upload URL for Supabase Storage
router.post('/presigned', auth(), async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { filename, contentType } = body as { filename?: string; contentType?: string };

  if (!filename) throw AppError.validation('Filename is required');

  // Local storage fallback
  if (config.storage.provider === 'local' || !config.storage.s3.endpoint) {
    const objectKey = `${Date.now()}-${filename}`;
    return c.json({
      success: true,
      data: {
        upload_url: `/uploads/${objectKey}`,
        method: 'PUT',
        object_key: objectKey,
        public_url: `/uploads/${objectKey}`,
      },
    });
  }

  // Supabase Storage (S3-compatible) presigned URL generation
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');

  const s3 = new S3Client({
    region: config.storage.s3.region,
    endpoint: config.storage.s3.endpoint,
    credentials: {
      accessKeyId: config.storage.s3.accessKey,
      secretAccessKey: config.storage.s3.secretKey,
    },
    forcePathStyle: true,
  });

  const objectKey = `${Date.now()}-${filename}`;

  const command = new PutObjectCommand({
    Bucket: config.storage.s3.bucket,
    Key: objectKey,
    ContentType: contentType || 'application/octet-stream',
  });

  const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 3600 });

  return c.json({
    success: true,
    data: {
      upload_url: uploadUrl,
      method: 'PUT',
      object_key: objectKey,
      public_url: `${config.storage.s3.endpoint}/${config.storage.s3.bucket}/${objectKey}`,
    },
  });
});

export { router as uploadRouter };
