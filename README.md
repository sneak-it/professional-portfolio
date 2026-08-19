# Professional Portfolio

A modern, highly polished personal portfolio website.

## Features

- **MDX Blog**: Write blog posts using Markdown and React components.
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

1. Create the directories that get mounted into the container:

   ```bash
   mkdir -p public/portfolio/photography
   ```

   The compose file runs the root `:latest` image, which can read them as-is. To run the hardened `:latest-nonroot` variant instead, switch the `image:` tag, uncomment the `user: "65532:65532"` line, and make those directories traversable by that uid:

   ```bash
   chmod o+rx content content/blog content/portfolio public/portfolio public/portfolio/photography
   ```

2. Copy `docker-compose.yml` and `.env.example` from the root of the repository, then `cp .env.example .env` and edit the values you care about. Every variable is optional and falls back to the default shown in the file.

3. Start the container:

   ```bash
   docker compose up -d
   ```

4. The app will be available at `http://localhost:3000`.

`content/` and `public/portfolio/` are mounted read-only into the container (see `docker-compose.yml`), so you can add or edit blog posts, projects, and photos on the host and they are served immediately — no rebuild required. The image ships a healthcheck (`/api/health`); the compose file adds resource limits and hardened security options.

Site identity (name, description, monogram, avatar, social links) and the canonical production URL are **runtime** environment variables, documented with their defaults in `.env.example`. They are read when the container starts, so the same prebuilt image serves any identity under any domain — no rebuild required. The compose file loads them from `.env` via `env_file`; the file is optional and each variable falls back to a placeholder default. `SITE_URL` (no trailing slash) is the one worth setting first: it drives Open Graph cards, the sitemap, robots.txt, and JSON-LD, and falls back to `http://localhost:3000`.

#### What can and cannot be set at runtime

Everything in `.env.example` is read when the process starts, so an `env_file` entry or a `-e` flag is
enough. Two things are not, because Next serializes them into the build output:

- **Response headers, including the CSP.** `next.config.ts` `headers()` is baked into
  `.next/routes-manifest.json` at build time.
- **Allowed remote image hosts.** `images.remotePatterns` is baked into
  `.next/required-server-files.json`.

Changing either requires rebuilding the image, using a Docker build `ARG` if the value has to vary per
deployment. "`SITE_URL` is a runtime variable" does not generalize to "everything is".

This matters for one variable in particular. `SITE_AVATAR_URL` is a runtime value pointing at a host
governed by build-time policy, so if you point it off `picsum.photos`, the page still returns 200 while
the optimizer returns 400 and the portrait is silently blank. Keep it on an allowed host, or rebuild
with your host added to both `images.remotePatterns` and the CSP `img-src`.

### Caching

Every content route renders per request, so content edits and `SITE_*` changes take effect
immediately, and every document request reaches the Node process. `next.config.ts` already sends
`Cache-Control: s-maxage=60, stale-while-revalidate=120` on the pages worth caching, which lets a
shared cache absorb repeat traffic without giving up per-request rendering. Cloudflare ignores that
header for HTML until a Cache Rule marks it eligible; see [CLOUDFLARE.md](CLOUDFLARE.md) for the
dashboard side, which is not optional if you run behind Cloudflare.

### Building manually

The default target is the root image; pass `--target production-nonroot` for the uid 65532 variant.

```bash
docker build -t portfolio-app .
docker run -p 3000:3000 \
  -e SITE_URL=https://your-domain \
  -v "$(pwd)/content:/app/content:ro" \
  -v "$(pwd)/public/portfolio:/app/public/portfolio:ro" \
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

### Adding a Blog Post

1. Create a new `.mdx` file in `content/blog/`. The filename becomes the URL slug.
2. Add the required frontmatter:

   ```mdx
   ---
   title: 'Your Post Title'
   date: 'YYYY-MM-DD'
   excerpt: 'A short summary.'
   image: 'https://example.com/cover.jpg'
   category: 'Category'
   readTime: 'X min read'
   ---
   ```

3. Write your content below using Markdown.

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
   ---
   ```

3. Create a folder in `public/portfolio/photography/` with the **exact same name** as the `.mdx` file (e.g. `public/portfolio/photography/my-trip/`).
4. Drop your images (`.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`) inside that folder. Dimensions are read automatically and the images are rendered in the gallery with a lightbox. If the folder is empty, placeholder images are shown.

> When running under Docker Compose, `content/` and `public/portfolio/` are bind-mounted, so new posts, projects, and photos appear without rebuilding the image.
