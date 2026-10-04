// Pre-deployment checks against the built site in dist/.
// Verifies internal links, SEO tags, JSON-LD, sitemap, RSS, robots and images.
// Exit code 1 if anything fails.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const DIST = join(process.cwd(), 'dist');
const SITE = 'https://www.hairmusedaily.com';
let failures = 0;
const fail = (name, detail) => {
  failures++;
  console.log(`FAIL ${name}${detail ? ` — ${detail}` : ''}`);
};
const pass = (name) => console.log(`PASS ${name}`);

if (!existsSync(DIST)) {
  console.error('dist/ does not exist — run `npx astro build` first');
  process.exit(1);
}

// ---- collect files --------------------------------------------------------
const allFiles = [];
(function walk(dir) {
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry);
    if (statSync(p).isDirectory()) walk(p);
    else allFiles.push(p);
  }
})(DIST);

const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));
const relFiles = new Set(allFiles.map((f) => f.slice(DIST.length).replace(/\\/g, '/').replace(/^\/+/, '')));

// ---- 1. internal links resolve ---------------------------------------------
const badLinks = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const attrs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1]);
  for (const raw of attrs) {
    if (/^(https?:|mailto:|tel:|data:|#)/.test(raw)) continue;
    let path = raw.split('#')[0].split('?')[0];
    if (!path || path === '/') path = '/index.html';
    let candidate = path.endsWith('.html') || /\.[a-z0-9]+$/i.test(path)
      ? path
      : `${path.replace(/\/$/, '')}/index.html`;
    if (!relFiles.has(candidate.replace(/^\//, ''))) {
      badLinks.push(`${file.slice(DIST.length)} -> ${raw}`);
    }
  }
}
badLinks.length === 0
  ? pass(`internal links (${htmlFiles.length} pages scanned)`)
  : fail('internal links', `${badLinks.length} broken: ${badLinks.slice(0, 5).join(' | ')}`);

// ---- 2. SEO tags on every page ---------------------------------------------
const seoIssues = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  const page = file.slice(DIST.length);
  if (!/<title>[^<]{3,}<\/title>/.test(html)) seoIssues.push(`${page}: title`);
  if (!/<meta name="description" content="[^"]{10,}"/.test(html)) seoIssues.push(`${page}: description`);
  if (!new RegExp(`rel="canonical" href="${SITE}/`).test(html)) seoIssues.push(`${page}: canonical`);
  if (!/property="og:title"/.test(html)) seoIssues.push(`${page}: og:title`);
  if (!new RegExp(`property="og:image" content="${SITE}/`).test(html)) seoIssues.push(`${page}: og:image`);
  if (!/name="twitter:card" content="summary_large_image"/.test(html)) seoIssues.push(`${page}: twitter:card`);
}
seoIssues.length === 0
  ? pass('per-page SEO tags (title, description, canonical, og, twitter)')
  : fail('per-page SEO tags', seoIssues.slice(0, 6).join(' | '));

// ---- 3. JSON-LD parses -------------------------------------------------------
const ldIssues = [];
let ldCount = 0;
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    ldCount++;
    try {
      const data = JSON.parse(m[1]);
      if (!data['@context'] || !data['@type']) ldIssues.push(`${file}: missing @context/@type`);
    } catch {
      ldIssues.push(`${file.slice(DIST.length)}: invalid JSON`);
    }
  }
}
ldIssues.length === 0
  ? pass(`JSON-LD blocks parse (${ldCount} blocks)`)
  : fail('JSON-LD', ldIssues.join(' | '));

// ---- 4. sitemap ---------------------------------------------------------------
const sitemapIndex = readFileSync(join(DIST, 'sitemap-index.xml'), 'utf8');
const childMatch = sitemapIndex.match(/<loc>([^<]+sitemap-0\.xml)<\/loc>/);
if (!childMatch) {
  fail('sitemap', 'sitemap-0.xml not referenced in sitemap-index.xml');
} else {
  const sm = readFileSync(join(DIST, 'sitemap-0.xml'), 'utf8');
  const locs = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  const badLocs = locs.filter((loc) => {
    if (!loc.startsWith(SITE + '/')) return true;
    const path = loc.slice(SITE.length) || '/';
    const file = path.endsWith('/') ? `${path}index.html` : path;
    return !relFiles.has(file.replace(/^\//, ''));
  });
  const has404 = locs.some((l) => l.includes('404'));
  badLocs.length === 0 && !has404
    ? pass(`sitemap URLs resolve (${locs.length} URLs, 404 excluded)`)
    : fail('sitemap', `${badLocs.length} unresolvable${has404 ? ', 404 included' : ''}: ${badLocs.slice(0, 3).join(' ')}`);
}

// ---- 5. RSS --------------------------------------------------------------------
const rss = readFileSync(join(DIST, 'rss.xml'), 'utf8');
const rssItems = [...rss.matchAll(/<item>([\s\S]*?)<\/item>/g)];
const rssLinks = rssItems.map((item) => item[1].match(/<link>([^<]+)<\/link>/)?.[1]);
const postPages = [...relFiles].filter((file) => /^blog\/[^/]+\/index\.html$/.test(file));
const badRss = rssLinks.filter((link) => !link?.startsWith(`${SITE}/`) ||
  !relFiles.has(`${link.slice(SITE.length + 1)}index.html`));
rssItems.length === postPages.length && badRss.length === 0
  ? pass(`RSS feed (${rssItems.length} posts, all links resolve)`)
  : fail('RSS', `${rssItems.length} items for ${postPages.length} posts, ${badRss.length} broken links`);

// ---- 6. robots.txt --------------------------------------------------------------
const robots = readFileSync(join(DIST, 'robots.txt'), 'utf8');
robots.includes(`Sitemap: ${SITE}/sitemap-index.xml`)
  ? pass('robots.txt sitemap directive')
  : fail('robots.txt', 'sitemap line missing or wrong domain');

// ---- 7. images ------------------------------------------------------------------
const svgRefs = [];
for (const file of htmlFiles) {
  const html = readFileSync(file, 'utf8');
  for (const m of html.matchAll(/(src|content)="(\/images\/pins\/[^"]+)"/g)) {
    if (!relFiles.has(m[2].slice(1))) svgRefs.push(`${file.slice(DIST.length)}: ${m[2]} missing`);
    else if (m[2].endsWith('.svg')) svgRefs.push(`${file.slice(DIST.length)}: ${m[2]} still svg`);
  }
}
svgRefs.length === 0
  ? pass('all pin images exist on disk and use .jpg')
  : fail('images', svgRefs.slice(0, 5).join(' | '));

existsSync(join(DIST, 'favicon.svg')) ? pass('favicon.svg') : fail('favicon.svg missing');
existsSync(join(DIST, '404.html')) ? pass('404 page') : fail('404.html missing');

// ---- summary ---------------------------------------------------------------------
console.log(`\n${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK GROUP(S) FAILED'}`);
process.exitCode = failures === 0 ? 0 : 1;
