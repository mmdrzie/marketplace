import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourdomain.ir';

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    ...['sedan', 'motorcycles', 'tractor-head', 'trailer', 'truck', 'light-truck', 'industrial-machinery', 'agricultural-machinery', 'construction-machinery', 'bus-van', 'parts'].map((slug) => ({
      url: `${baseUrl}/categories/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })),
  ];
}
