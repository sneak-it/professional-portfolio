# Professional Portfolio

A modern, highly polished personal portfolio/blog. This is aimed at self-hosters who want a beautiful personal site that's not overly complicated, has minimal dependencies, and no overhead of a CMS whilst still taking advantage of the npm ecosystem to provide a feature-rich and aesthetic site. This site has been optimized to provide a dynamic, yet lightweight experience for both the operator and the visiting users.

## Features

- **MDX Blog**: GitHub-Flavored Markdown plus React components, with read time, excerpt, and table of contents derived from the post body. See [CONTENT.md](CONTENT.md) for details.
- **Tag browsing and RSS**: One-tag filtering at the Blog, previous/next post navigation, and an RSS feed at `/feed.xml`.
- **Unified Portfolio**: Technology Consulting, Open Source, and Photography, all driven by MDX.
- **Auto-discovered Galleries**: Photography galleries build their image lists from the filesystem, with a scrollable layout and lightbox. Every image is re-encoded on the way out, so EXIF data never reaches a visitor. See [PHOTOGRAPHY.md](PHOTOGRAPHY.md).
- **Incremental content**: Content routes render per request, so a dropped-in file appears with no rebuild.
- **Fully Responsive**: Optimized for all screen sizes.
- **Light/Dark/System Mode Support**: Color scheme adapts to user preference.
- **Docker Ready**: Hardened multi-stage `Dockerfile` and `docker-compose.yml`.

## Running with Docker (recommended)

1. Copy `docker-compose.yml` and `.env.example` from this repository, then
   `cp .env.example .env` and edit the values you care about.
2. `docker compose up -d`
3. Open http://localhost:3000

Compose creates `./content` and `./media/portfolio/photography` on the host if they are
missing, and mounts them read-only, so blog posts, projects, and photographs added there
are served immediately with no rebuild. Starting with an empty host tree is fine: the
image ships its own avatar and demo assets, and the site renders with no content.

Cloning the repository and running Compose from it instead serves the bundled example
content, since the mounts then point at the repository's own `content/`.

### Environment variables

All are optional and read at container start, so one prebuilt image serves any identity
under any domain. Compose loads them from `.env` via `env_file`. Because that file is
optional, a missing or misplaced `.env` is not an error: the container logs
`[site] SITE_NAME unset` at start when it never loaded.

| Variable | Purpose | Default |
| --- | --- | --- |
| `SITE_URL` | Canonical origin for Open Graph cards, sitemap, robots.txt, and JSON-LD. Absolute `http(s)` URL, no trailing slash. | `http://localhost:3000` |
| `SITE_NAME` | Site identity, used wherever a name is shown. | `Your Name` |
| `SITE_TITLE` | Browser and Open Graph title. | `SITE_NAME` |
| `SITE_DESCRIPTION` | Meta description. | `Personal portfolio and blog: projects, writing, and photography.` |
| `SITE_AUTHOR` | Byline and JSON-LD author. | `SITE_NAME` |
| `SITE_LOCATION` | Location shown on the site. | `Your City, ST` |
| `SITE_MONOGRAM` | Wordmark in the navbar, footer, generated icons, and OG card. First 3 characters used. | `YN` |
| `SITE_LOCALE` | BCP 47 tag for `<html lang>` and the OG locale. | `en-US` |
| `SITE_AVATAR_URL` | Portrait on the about page and blog byline. Site-relative only; see [DOCKER.md](DOCKER.md). | `/media/images/avatar-placeholder.png` |
| `SITE_GITHUB_URL` | GitHub profile link. Empty hides it. | `https://github.com/your-username` |
| `SITE_LINKEDIN_URL` | LinkedIn profile link. Empty hides it. | `https://linkedin.com/in/your-profile` |
| `SITE_EMAIL` | Contact email. Unset omits the contact card. | unset |
| `BLOG_POSTS_PER_PAGE` | Posts per page on `/blog`. | `3` |
| `SITEMAP_CACHE_TTL_MS` | How long `sitemap.xml` and `feed.xml` reuse a scanned content list. Pages render per request and are unaffected. | `300000` |
| `IMAGE_DIMENSION_CACHE_MAX` | Entries in the image dimension cache, one per distinct image path rendered. | `2000` |

Non-integer or non-positive values for the tuning variables fall back to the default.

Image variants, manual builds, caching, and what cannot be changed without a rebuild:
[DOCKER.md](DOCKER.md). Behind Cloudflare, also read [CLOUDFLARE.md](CLOUDFLARE.md).

## Running locally

Requires Node.js 26.x and npm.

```bash
git clone https://github.com/sneak-it/professional-portfolio.git
cd professional-portfolio
npm install
npm run build
npm run start
```

Then open http://localhost:3000.

