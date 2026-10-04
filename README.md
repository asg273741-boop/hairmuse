# HairMuse

A fast, SEO-optimized hairstyle blog built with [Astro](https://astro.build) —
designed for Pinterest traffic: post-focused layouts, tall pin-style imagery,
a masonry "board" grid and zero JavaScript by default.

![Astro](https://img.shields.io/badge/built%20with-Astro-BC52EE?logo=astro)

## Quick start

```bash
npm ci
npm run dev      # local dev at http://localhost:4321
npm run build    # static production build into ./dist
npm run preview  # serve the production build locally
```

## Before you go live

1. **Your domain** — the production URL is `https://www.hairmusedaily.com`.
   It is used in `astro.config.mjs`, `src/consts.ts`, `public/robots.txt`
   and `scripts/final-checks.mjs`. Update all four if the domain changes.
2. **Your identity** — edit `src/consts.ts`: site name, description, email
   and especially `SITE.pinterest` (where all the "Follow on Pinterest"
   buttons point). Also update `NAV_CATEGORIES` there if you rename or add
   categories — those feed the header and footer.
3. **Your images** — posts use JPGs in `public/images/pins/`. Keep new
   photos at tall ratios (**2:3 or 4:5**, JPG
   or PNG) so cards, og:image previews and Pinterest shares look right.

## Deploying to Cloudflare Pages

1. Copy the whole project folder, including its hidden `.git` directory, to the
   machine you will push from. Add your Git remote and push `main`:

   ```bash
   git remote add origin <your-repository-url>
   git push -u origin main
   ```

2. In Cloudflare: **Workers & Pages → Create application → Pages → Import an
   existing Git repository** and pick this repository.
3. Build settings:
   - **Framework preset:** Astro (or fill in manually)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Node.js:** `.node-version` pins 22.19.0; no dashboard override is needed.
4. Deploy, then add `www.hairmusedaily.com` under the Pages project's
   **Custom domains**. Complete the DNS/CNAME step shown by Cloudflare. If you
   also use `hairmusedaily.com`, redirect it to the `www` address with a
   Cloudflare Redirect Rule. Confirm the custom domain is active before sharing
   the site or submitting its sitemap.

## Pre-deploy checks

```bash
npm run build
npm run check    # validates links, SEO tags, JSON-LD, sitemap, RSS, images
```

## Writing a post

Drop a Markdown file into `src/content/blog/`. The filename becomes the URL
(`my-post.md` → `/blog/my-post/`). Frontmatter:

```yaml
---
title: "My Post Title"
description: "A 150–160 character summary used for meta tags, cards and RSS."
pubDate: 2026-10-03
category: "Updos & Buns" # one of: Updos & Buns, Waves & Curls, Braids, Bangs & Bobs
image: "/images/pins/my-post.jpg"
imageAlt: "Describe the image for accessibility and image SEO"
tags: ["messy bun", "easy hairstyles"]
pinDescription: "Optional: the text used when someone shares this post on Pinterest"
draft: false
---
```

The homepage automatically features your newest post and adds new categories
to the board — you only maintain the Markdown files and `NAV_CATEGORIES`.

## What's inside

```
src/
├── content/blog/        # Markdown posts
├── components/          # SEO head, header, footer, post card
├── layouts/             # BaseLayout (fonts, styles, skip link)
├── pages/
│   ├── index.astro      # Homepage: hero, featured post, masonry board
│   ├── blog/            # Archive + [slug] post template
│   ├── category/[category]  # Auto-generated category pages
│   ├── about.astro
│   ├── 404.astro
│   └── rss.xml.js       # RSS feed
├── styles/global.css    # Design tokens + all styling
└── consts.ts            # ← site settings live here
public/
├── images/pins/         # Pin images (2:3 / 4:5 / 1:1)
├── favicon.svg
└── robots.txt
scripts/
├── generate-pins.mjs    # Regenerates the placeholder pins
├── audit-overflow.mjs   # Mobile overflow checker (headless Chrome)
└── shot-mobile.mjs      # True mobile-viewport screenshots
```

## SEO features built in

- Per-page titles, meta descriptions, canonical URLs
- Open Graph + Twitter cards (including `article:published_time` on posts)
- JSON-LD structured data: `WebSite`, `Blog`, `BlogPosting`, `BreadcrumbList`,
  `CollectionPage`
- `sitemap-index.xml` via `@astrojs/sitemap`, linked in `robots.txt`
- RSS feed at `/rss.xml`
- Semantic HTML, breadcrumbs, image alt text, keyword-rich category pages

## Performance

- Static HTML — zero framework JS shipped to the browser
- Self-hosted fonts (`@fontsource`) — no external font requests
- Single small stylesheet, auto-inlined when small enough
- Lazy-loaded images below the fold, `fetchpriority="high"` on heroes
- Width/height on every image to avoid layout shift

## Design tokens

The whole look is controlled by the variables at the top of
`src/styles/global.css`: cream background `#fbf7f1`, espresso ink `#2a211b`,
terracotta accent `#b85c38`, Playfair Display headings, Inter body.
