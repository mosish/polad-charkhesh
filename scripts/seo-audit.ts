import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { auditPublishedSeo } from '../lib/seo-audit';

const args = process.argv.slice(2);
const option = (name: string, fallback: string) => args.includes(name) ? args[args.indexOf(name) + 1] || fallback : fallback;
const base = option('--base', 'http://127.0.0.1:5173');
const read = async (route: string) => {
  const response = await fetch(new URL(route, base));
  if (!response.ok) throw new Error(`${route}: HTTP ${response.status}`);
  return response.json();
};
const [products, company, content, seo] = await Promise.all(['/api/products', '/api/company', '/api/content', '/api/seo'].map(read));
const report = auditPublishedSeo({ products: products.products, company: company.data, content: content.data, seo: seo.data });
const out = path.resolve(option('--out', 'outputs/seo-audit.json'));
mkdirSync(path.dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
console.log(`SEO audit: ${report.products} products, ${report.pages} public pages, ${report.languageVariants} language variants, ${report.issues.length} findings. Report: ${out}`);
if (report.issues.length) { console.table(report.issues); process.exitCode = 1; }
