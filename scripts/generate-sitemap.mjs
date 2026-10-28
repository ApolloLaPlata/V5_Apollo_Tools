import fs from 'fs';
import path from 'path';

const toolsPath = path.resolve('src/lib/data/toolsData.ts');
const content = fs.readFileSync(toolsPath, 'utf8');
const idMatches = [...content.matchAll(/id:\s*['"]([^'"]+)['"]/g)].map(m => m[1]);
const uniqueIds = Array.from(new Set(idMatches));
console.log('Total unique tools found:', uniqueIds.length);

const today = new Date().toISOString().split('T')[0];
let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
xml += `  <url>\n    <loc>https://tools.v5apollo.com</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

for (const id of uniqueIds) {
  xml += `  <url>\n    <loc>https://tools.v5apollo.com/?tool=${encodeURIComponent(id)}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
}
xml += `</urlset>\n`;

const sitemapPath = path.resolve('public/sitemap.xml');
fs.writeFileSync(sitemapPath, xml, 'utf8');
console.log(`Generated ${sitemapPath} with ${uniqueIds.length} tool entries.`);
