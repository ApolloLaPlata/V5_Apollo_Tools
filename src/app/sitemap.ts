import { MetadataRoute } from 'next';
import { TOOLS_CATALOG } from '@/lib/data/toolsData';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://tools.v5apollo.com';

  const toolEntries: MetadataRoute.Sitemap = TOOLS_CATALOG.map((tool) => ({
    url: `${baseUrl}/?tool=${tool.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: tool.popular ? 0.9 : 0.75,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...toolEntries,
  ];
}
