import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'public');
const origin = 'https://noviq.tcflick.com';
const read = file => readFile(path.join(root, file), 'utf8');
const sitemap = await read('sitemap.xml');
const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
assert.equal(new Set(urls).size, urls.length, 'Duplicate sitemap URL');

const htmlFiles = (await readdir(root)).filter(file =>
  file.endsWith('.html') && file !== '404.html'
);
assert.equal(urls.length, htmlFiles.length, 'Sitemap must include each indexable HTML file');

for (const url of urls) {
  assert.ok(url.startsWith(origin + '/'), `Wrong origin: ${url}`);
  const pathname = new URL(url).pathname;
  assert.ok(!pathname.endsWith('.html'), `Redirecting sitemap URL: ${url}`);
  const file = pathname === '/' ? 'index.html' : pathname.slice(1) + '.html';
  assert.ok(htmlFiles.includes(file), `Missing HTML file: ${file}`);
  const html = await read(file);
  assert.ok(html.includes(`rel="canonical" href="${url}"`), `Canonical mismatch: ${file}`);
}

for (const file of htmlFiles) {
  const html = await read(file);
  assert.ok(!/https:\/\/noviq\.tcflick\.com\/[a-z0-9-]+\.html\b/i.test(html),
    `Legacy absolute URL in ${file}`);
  for (const match of html.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)) {
    assert.ok(!/^(?:\.\/)?\/?[a-z0-9-]+\.html(?:[?#]|$)/i.test(match[1]),
      `Redirecting internal link in ${file}: ${match[1]}`);
  }
}

console.log(`NOVIQ SEO check passed: ${urls.length} sitemap URLs, canonicals and internal links.`);
