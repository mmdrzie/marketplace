import { Hono } from 'hono';
import { auth } from '../middleware/auth';
import { config } from '../config';
import { AppError } from '../errors';

const router = new Hono();

// POST /upload/presigned — generate presigned upload URL for Supabase Storage
router.post('/presigned', auth(), async (c) => {
  const body = await c.req.json().catch(() => ({}));
  const { filename, contentType } = body as { filename?: string; contentType?: string };

  if (!filename) throw AppError.validation('Filename is required');

  // For MVP with local storage, return a dummy URL
  // When Supabase Storage is configured, this will generate actual presigned URLs
  if (config.storage.provider === 'local' || !config.storage.s3.endpoint) {
    return c.json({
      success: true,
      data: {
        url: `/uploads/${Date.now()}-${filename}`,
        method: 'PUT',
        fields: {},
      },
    });
  }

  // S3 presigned URL generation (placeholder for when storage provider is configured)
  throw AppError.internal('S3 storage not yet configured');
});

export { router as uploadRouter };
