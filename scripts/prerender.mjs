/**
 * Emits one real HTML file per route from the built index.html, with that
 * route's title, description and canonical baked in.
 *
 * Vercel serves a matching static file before falling back to the SPA rewrite,
 * so /about is a genuine document. This matters because social crawlers
 * (Facebook, LinkedIn, Slack) do not execute JavaScript — without it every
 * shared link previews as the homepage.
 *
 * sitemap.xml is generated here too so it can never drift from the route table.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

/** Reads the route table out of the TypeScript source, so there is one source of truth. */
async function loadRoutes() {
  // Normalise line endings first: an editor on Windows may save CRLF, and the
  // block split below would otherwise find no routes at all.
  const source = (await readFile(join(root, 'src', 'routes.ts'), 'utf8')).replace(/\r\n?/g, '\n');

  const siteUrl = source.match(/SITE_URL\s*=\s*'([^']+)'/)?.[1];
  if (!siteUrl) throw new Error('Could not read SITE_URL from src/routes.ts');

  const body = source.slice(source.indexOf('export const ROUTES'));
  const routes = [];

  for (const block of body.split(/\n\s{2}\{\n/).slice(1)) {
    const read = (key) => {
      const match = block.match(new RegExp(`${key}:\\s*\\n?\\s*'((?:[^'\\\\]|\\\\.)*)'`));
      return match ? match[1].replace(/\\'/g, "'") : undefined;
    };
    const path = read('path');
    if (!path) continue;

    routes.push({
      path,
      title: read('title'),
      description: read('description'),
      priority: Number(block.match(/priority:\s*([\d.]+)/)?.[1] ?? 0.5),
      inSitemap: /priority:/.test(block),
    });
  }

  if (routes.length === 0) throw new Error('No routes parsed from src/routes.ts');
  return { siteUrl, routes };
}

const escapeHtml = (value) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Swaps the metadata in the built shell for this route's values. */
function renderRoute(shell, route, siteUrl) {
  const url = `${siteUrl}${route.path}`;
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);

  return shell
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /(<meta\s+name="description"\s+content=")[\s\S]*?(")/,
      `$1${description}$2`
    )
    .replace(/(<link\s+rel="canonical"\s+href=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta\s+property="og:url"\s+content=")[^"]*(")/, `$1${url}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${title}$2`)
    .replace(
      /(<meta\s+property="og:description"\s+content=")[\s\S]*?(")/,
      `$1${description}$2`
    )
    .replace(/(<meta\s+name="twitter:title"\s+content=")[^"]*(")/, `$1${title}$2`)
    .replace(
      /(<meta\s+name="twitter:description"\s+content=")[\s\S]*?(")/,
      `$1${description}$2`
    );
}

function renderSitemap(routes, siteUrl) {
  const today = new Date().toISOString().slice(0, 10);
  const entries = routes
    .filter((r) => r.inSitemap)
    .map(
      (r) => `  <url>
    <loc>${siteUrl}${r.path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${r.path === '/' ? 'daily' : 'monthly'}</changefreq>
    <priority>${r.priority.toFixed(1)}</priority>
  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</urlset>
`;
}

const { siteUrl, routes } = await loadRoutes();
const shell = await readFile(join(dist, 'index.html'), 'utf8');

for (const route of routes) {
  const html = renderRoute(shell, route, siteUrl);

  if (route.path === '/') {
    await writeFile(join(dist, 'index.html'), html);
  } else {
    // Written as <route>/index.html so the URL works with and without a slash.
    const dir = join(dist, route.path.slice(1));
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, 'index.html'), html);
  }
  console.log(`  prerendered ${route.path.padEnd(10)} ${route.title}`);
}

await writeFile(join(dist, 'sitemap.xml'), renderSitemap(routes, siteUrl));
console.log(`  sitemap.xml  ${routes.filter((r) => r.inSitemap).length} URLs`);
