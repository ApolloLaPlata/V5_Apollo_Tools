import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/private/'],
      },
      {
        userAgent: ['Googlebot', 'Bingbot', 'PerplexityBot', 'Applebot'],
        allow: '/',
      }
    ],
    sitemap: 'https://tools.v5apollo.com/sitemap.xml',
  };
}
