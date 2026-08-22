# Professional Portfolio

A modern, highly polished personal portfolio website.

## Features

- **MDX Blog**: GitHub-Flavored Markdown plus React components, with read time, excerpt, and table of contents derived from the post body.
- **Tag browsing and RSS**: One-tag filtering at `/blog?tag=`, previous/next post navigation, and a feed at `/feed.xml`.
- **Unified Portfolio**: A single Portfolio hub with three sections — Technology Consulting, Open Source, and Photography — all driven by MDX.
- **Auto-discovered Galleries**: Photography galleries build their image lists automatically from the filesystem, with a scrollable layout and lightbox.
- **Incremental content**: Content routes render per request, so a dropped-in file appears with no rebuild and no revalidation window.
- **Fully Responsive**: Optimized for all screen sizes.
- **Light/Dark/System Mode Support**: Color scheme adapts to user preference, ability to switch to light and dark mode.
- **Docker Ready**: Ships a hardened multi-stage `Dockerfile` and `docker-compose.yml` for the preferred deployment path.

## Deployment (Docker)

Docker is the recommended way to run this site. The build uses Next.js standalone output on a distroless base (no shell, no package manager), so the runtime image is small and self-contained.

Two image variants are published from the same layers:

| Tag | User | Notes |
| --- | --- | --- |
| `:latest`, `:<version>`, `:dev` | root (uid 0) | Default. What `docker-compose.yml` runs and what a plain `docker build .` produces. |
| `:latest-nonroot`, `:<version>-nonroot`, `:dev-nonroot` | `nonroot` (uid 65532) | Hardened variant. Opt in per the note in step 1 below. |

### Using Docker Compose (recommended)

1. Copy `docker-compose.yml` and `.env.example` from the root of the repository, then `cp .env.example .env` and edit the values you care about. Every variable is optional and falls back to the default shown in the file.

2. Start the container:

   ```bash
   docker compose up -d
   ```

3. The app will be available at `http://localhost:3000`.

To run the hardened `:latest-nonroot` image instead of the default `:latest`, switch the `image:` tag
and uncomment the `user: "65532:65532"` line. There is no permission step for either variant, and
none when you drop in a post or a photo: `cap_drop: ALL` strips `DAC_OVERRIDE`, so the default root
image reads the mounts under the same rules as the nonroot one, and both are satisfied by the
world-readable modes a default umask already produces.

If a tree genuinely is unreadable — a hardened umask, a restrictive parent directory — the site
renders empty rather than failing, and the container logs `Cannot read content dir "<path>"` so it is
visible in `docker logs`. `chmod -R a+rX content public` fixes it; capital `X` sets the search bit on
directories only, so nothing becomes executable.

`content/` and `public/` are mounted read-only into the container (see `docker-compose.yml`), so you can add or edit blog posts, projects, and photos on the host and they are served immediately — no rebuild required. The same applies to page copy: the homepage hero lives in `content/home.mdx`, the about page in `content/about.mdx`, and the contact page in `content/contact.mdx`. Each falls back to a generic default if the file is absent. The image ships a healthcheck (`/api/health`); the compose file adds resource limits and hardened security options.

Site identity (name, description, monogram, locale, avatar, email, social links) and the canonical production URL are **runtime** environment variables, documented with their defaults in `.env.example`. They are read when the container starts, so the same prebuilt image serves any identity under any domain — no rebuild required. The compose file loads them from `.env` via `env_file`; the file is optional and each variable falls back to a placeholder default. Because it is optional, a `.env` that is missing or sits outside the compose project directory is not an error, so the container logs `[site] SITE_NAME unset` at start; if you see that line in `docker logs`, the file never loaded. `SITE_URL` (no trailing slash) is the one worth setting first: it drives Open Graph cards, the sitemap, robots.txt, and JSON-LD, and falls back to `http://localhost:3000`. It must be an absolute `http(s)` URL, scheme included; anything else is rejected with a warning and the fallback is used rather than failing the request.

#### What can and cannot be set at runtime

Everything in `.env.example` is read when the process starts, so an `env_file` entry or a `-e` flag is
enough. Two things are not, because Next serializes them into the build output:

- **Response headers, including the CSP.** `next.config.ts` `headers()` is baked into
  `.next/routes-manifest.json` at build time.
- **Optimizable image paths.** `images.localPatterns` is baked into
  `.next/required-server-files.json`.

Changing either requires rebuilding the image, using a Docker build `ARG` if the value has to vary per
deployment. "`SITE_URL` is a runtime variable" does not generalize to "everything is".

This matters for `SITE_AVATAR_URL`. Images are same-origin only: there are no `images.remotePatterns`
and the CSP sets `img-src 'self'`, so a remote avatar URL will not load. Point it at a site-relative
path under `/images/` and mount the file into `public/images/`, the same way galleries are mounted.
A path outside the directories in `images.localPatterns` returns a 400 from the optimizer while the
page still returns 200, so the portrait goes blank without an error; the default `/images/avatar-placeholder.png` is always a valid path, but the mount means the host copy is the one served: keep the file in `public/images/` or the portrait goes blank the same way.

### Caching

Every content route renders per request, so content edits and `SITE_*` changes take effect
immediately, and every document request reaches the Node process. `next.config.ts` already sends
`Cache-Control: s-maxage=300, stale-while-revalidate=600` on the pages worth caching, which lets a
shared cache absorb repeat traffic without giving up per-request rendering. Cloudflare ignores that
header for HTML until a Cache Rule marks it eligible; see [CLOUDFLARE.md](CLOUDFLARE.md) for the
dashboard side, which is not optional if you run behind Cloudflare.

The three generated brand images (`/brand/icon`, `/brand/apple-icon`, `/brand/opengraph-image`) are
cached far longer, because each request is a full rasterize. Their URLs carry a version token derived
from the identity and palette they draw, so a `SITE_*` change moves the URL and takes effect
immediately with no purge and no hard refresh. Editing one of the renderers in `app/brand/` does not
move the token, and waits out the 24-hour `s-maxage` or a purge.

### Building manually

The default target is the root image; pass `--target production-nonroot` for the uid 65532 variant.

```bash
docker build -t portfolio-app .
docker run -p 3000:3000 \
  -e SITE_URL=https://your-domain \
  -v "$(pwd)/content:/app/content:ro" \
  -v "$(pwd)/public:/app/public:ro" \
  portfolio-app
```

## Running Locally

### Prerequisites

- Node.js 26.x
- npm

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/sneak-it/professional-portfolio.git
   cd professional-portfolio
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Build the server

   ```bash
   npm run build
   ```

4. Start the server:

   ```bash
   npm run start
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Content Management

All content is MDX. Site-wide metadata (name, description, social links) lives in `lib/site.ts`.

### Drafts and scheduled posts

Add `draft: true` to the frontmatter of any `.mdx` file, blog post or portfolio item. It drops out of
the listings, the section counts, and the sitemap, but stays reachable at its own URL so you can
preview it, served with `noindex, nofollow` so crawlers leave it alone.

A `date` in the future does the same thing, so a post publishes itself once that
date arrives — no flag to remember to remove. Nothing is scheduled server-side:
each request re-reads the file, so the post simply starts appearing. The sitemap
and the RSS feed lag by `SITEMAP_CACHE_TTL_MS` (default 5 minutes), so check the
page rather than `sitemap.xml` or `feed.xml` when confirming.

### Checking content

```bash
npm run check:content
```

Lints every file under `content/`: missing required fields, unknown keys (a
typo'd `catgeory:` otherwise does nothing at all), unparseable dates, a `draft`
that is the string `'true'` rather than a boolean, a cover image with no file
under `public/`, and tag spellings that collide. It also prints the full tag
vocabulary with counts, which is the fastest way to see what you already use
before tagging a new post. Exits non-zero on any error.

### Adding a Blog Post

1. Create a new `.mdx` file in `content/blog/`. The filename becomes the URL slug.
2. Add the frontmatter. Only `title` and `date` are required:

   ```mdx
   ---
   title: 'Your Post Title'
   date: 'YYYY-MM-DD'
   tags:
     - 'Tag One'
     - 'Tag Two'
   image: '/images/blog/cover.jpg'
   ---
   ```

   Optional: `excerpt` and `readTime` (both derived from the body when omitted),
   `updated: 'YYYY-MM-DD'` to show a revision date, `draft: true`, and
   `toc: true | false` to force or suppress the table of contents (shown by
   default once a post has four or more `##`/`###` headings).

3. Write your content below using Markdown, which includes the GitHub-Flavored
   extensions: tables, footnotes, task lists, `~~strikethrough~~`, and bare-URL
   autolinks. `content/blog/authoring-reference.mdx` is a draft post that
   exercises every frontmatter field, Markdown feature, and component on one
   page, including the ones that deliberately do not render.

In the body you can use `<Callout type="note|tip|warn" title="…">` and
`<Figure src alt caption />`, plus the layout components (`Container`, `Surface`,
`CoverCard`, `CoverImage`, `IconBadge`, `EmptyState`, `PostMeta`). Raw HTML is
not a feature: `<script>`, `<iframe>`, `<input>` and friends are stripped, images
must be same-origin, and links are limited to http/https/mailto.

Published posts are also served as RSS at `/feed.xml`, which every page links
from its `<head>`. Drafts and future-dated posts are excluded, and each post's
tags become its `<category>` entries. Like the sitemap, the item list is cached
for `SITEMAP_CACHE_TTL_MS`.

Tags are the only taxonomy, and they do double duty: `/blog?tag=<slug>` filters
the listing to one tag at a time, and the same list becomes the post's
`keywords`. The `/blog` filter chip expands to the full tag list with
post counts. Run `npm run check:content` before committing — it catches a tag
spelled two ways (`Next.js` vs `NextJS`), which is what fragments a vocabulary
over a few dozen posts.

### Portfolio

The Portfolio is organized into three sections under `content/portfolio/<section>/`:

- **Technology Consulting** — `content/portfolio/technology-consulting/` (project write-up)
- **Open Source** — `content/portfolio/open-source/` (project write-up)
- **Photography** — `content/portfolio/photography/` (image gallery)

Placeholder entries (`example-engagement.mdx`, `example-project.mdx`) are included as templates — copy one, rename it, and edit.

#### Adding a Project (Technology Consulting or Open Source)

1. Create a new `.mdx` file in the matching section folder (e.g. `content/portfolio/open-source/my-project.mdx`). The filename becomes the URL slug.
2. Add the frontmatter. The detail page only renders buttons/lists for the fields you fill in:

   ```mdx
   ---
   title: 'My Project'
   description: 'One-line summary.'
   date: 'YYYY-MM-DD'
   coverImage: 'https://example.com/cover.jpg'
   tech: ['TypeScript', 'Node.js']
   github: 'https://github.com/you/my-project' # optional
   link: 'https://my-project.dev' # optional
   features:
     - 'Key capability one'
     - 'Key capability two'
   challenges: 'The hardest problem and how you solved it.'
   ---
   ```

3. Write the long-form narrative in the MDX body below the frontmatter.

#### Adding a Photography Gallery

1. Create a new `.mdx` file in `content/portfolio/photography/` (e.g. `my-trip.mdx`). The filename becomes the gallery slug.
2. Add the frontmatter:

   ```mdx
   ---
   title: 'My Trip'
   description: 'Gallery description.'
   coverImage: 'https://example.com/cover.jpg' # optional; falls back to the first image
   alt: # optional; screen-reader description per image file
     dsc_0142.jpg: 'Fog lifting off the ridge at sunrise'
   ---
   ```

   Any image without an `alt:` entry falls back to "<gallery title>, photo N of M". That is a
   position, not a description, so write real `alt` text for photos that carry meaning.

3. Create a folder in `public/portfolio/photography/` with the **exact same name** as the `.mdx` file (e.g. `public/portfolio/photography/my-trip/`).
4. Drop your images (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`) inside that folder. Dimensions are read automatically and the images are rendered in the gallery with a lightbox. If the folder is empty, placeholder images are shown.

> When running under Docker Compose, `content/` and `public/` are bind-mounted, so new posts, projects, and photos appear without rebuilding the image.
