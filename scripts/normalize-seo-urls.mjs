import { readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const files = (await readdir(root)).filter(file => file.endsWith('.html'));
files.push('sitemap.xml');

function normalizeUrls(source) {
  // Cloudflare Workers Static Assets serves /loan.html at /loan by default.
  // Sitemap, canonical and structured-data URLs must point to that final path.
  let html = source.replace(
    /https:\/\/noviq\.tcflick\.com\/([a-z0-9-]+)\.html\b/gi,
    (_, slug) => `https://noviq.tcflick.com/${slug}`
  );

  // Avoid 307 redirects on internal links without altering visible link text.
  html = html.replace(/\bhref\s*=\s*(["'])([^"']+)\1/gi, (match, quote, value) => {
    const suffixAt = value.search(/[?#]/);
    const pathname = suffixAt < 0 ? value : value.slice(0, suffixAt);
    const suffix = suffixAt < 0 ? '' : value.slice(suffixAt);
    if (!/^(?:\.\/)?\/?[a-z0-9-]+\.html$/i.test(pathname)) return match;
    return `href=${quote}${pathname.slice(0, -5)}${suffix}${quote}`;
  });
  return html;
}

for (const file of files) {
  const target = path.join(root, file);
  const before = await readFile(target, 'utf8');
  const after = normalizeUrls(before);
  if (after !== before) {
    await writeFile(target, after);
    console.log(`Normalized SEO URLs: ${file}`);
  }
}
