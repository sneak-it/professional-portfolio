# Professional Portfolio

A modern, highly polished personal portfolio/blog. This is aimed at self-hosters who want a beautiful personal site that's not overly complicated, has minimal dependencies, and no overhead of a CMS whilst still taking advantage of the npm ecosystem to provide a feature-rich and aesthetic site. This site has been optimized to provide a dynamic, yet lightweight experience for both the operator and the visiting users.

## Features

- **MDX Blog**: GitHub-Flavored Markdown plus React components, with read time, excerpt, and table of contents derived from the post body. See [CONTENT.md](CONTENT.md) for details.
- **Tag browsing and RSS**: One-tag filtering at the Blog, previous/next post navigation, and an RSS feed at `/feed.xml`.
- **Unified Portfolio**: Technology Consulting, Open Source, and Photography, all driven by MDX.
- **Auto-discovered Galleries**: Photography galleries build their image lists from the filesystem, with a scrollable layout and lightbox. Every image is re-encoded on the way out, so EXIF data never reaches a visitor. See [PHOTOGRAPHY.md](PHOTOGRAPHY.md).
- **Incremental content**: Content routes render per request, so a dropped-in file appears with no rebuild.
- **Fully Responsive**: Optimized for all screen sizes.
- **Light and Dark Modes**: Follows the device's setting until a visitor picks one with the toggle.
- **Docker Ready**: Hardened multi-stage `Dockerfile` and `docker-compose.yml`.

## Running with Docker (recommended)

1. Copy `docker-compose.yml` and `.env.example` from this repository, then
   `cp .env.example .env` and edit the values you care about.
2. `mkdir -p ./content ./media`
3. **Recommended:** Connect your reverse proxy as described in [DOCKER.md](DOCKER.md#reverse-proxy).
4. `docker compose up -d`

Compose mounts those two paths read-only, so blog posts, projects, and photographs added
there are served immediately with no rebuild. Make them yourself as in step 2: Docker
creates a missing bind source root-owned, and you would then need `sudo` to add anything.
Starting with an empty host tree is fine: the site renders with no content and no avatar
until you add your own. To start from the bundled samples instead, see
[DOCKER.md](DOCKER.md#content-files).

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
| `SITE_BACKGROUND` | `gradient` (still), `solid`, `dots`, `grain`, or `topographic` for animated contour lines on desktop (phones and reduced motion get the gradient). | `gradient` |
| `SITE_AVATAR_URL` | Portrait on the about page and blog byline. Site-relative only; see [DOCKER.md](DOCKER.md). | `/media/images/avatar-placeholder.png` |
| `SITE_GITHUB_URL` | GitHub profile link. Empty hides it. | `https://github.com/your-username` |
| `SITE_LINKEDIN_URL` | LinkedIn profile link. Empty hides it. | `https://linkedin.com/in/your-profile` |
| `SITE_EMAIL` | Contact email. Unset omits the contact card. | unset |
| `SITE_JOB_TITLE` | Job title in the structured data. | unset |
| `SITE_PROFILE_URLS` | Extra profile URLs that are also you, comma-separated; tells search engines these profiles and the site are one person. GitHub and LinkedIn are included automatically. | unset |
| `SITE_PHOTO_LICENSE_URL` | License link on gallery photos, shown in Google Images: a page that states your terms, such as `/portfolio/photography` with a section note (see `CONTENT.md`), or a full URL. | unset |
| `CONTENT_DIR` | Content tree to serve when running from source, absolute or relative to the working directory. Leave unset under Docker and mount over `/app/content` instead. | `./content` |
| `MEDIA_DIR` | Media tree to serve when running from source, the same way. Replaces `./media` wholesale, so copy in any shipped image your content still uses. Leave unset under Docker and mount under `/app/media` instead. | `./media` |
| `BLOG_POSTS_PER_PAGE` | Posts per page on `/blog`. | `3` |
| `UV_THREADPOOL_SIZE` | Photo encodes at once. Each adds about 60 MB to peak memory, so raise the compose memory limit with it. | `2` in the image, `4` from source |

A non-integer or non-positive `BLOG_POSTS_PER_PAGE` falls back to the default. An empty, 0 or non-number `UV_THREADPOOL_SIZE` means 1; remove the line to keep the default.

Image tags, manual builds, caching, and what cannot be changed without a rebuild:
[DOCKER.md](DOCKER.md).

## Running locally

Requires Node.js 26.x and npm.

```bash
git clone https://github.com/sneak-it/professional-portfolio.git
cd professional-portfolio
npm ci
npm run build
npm run start
```

`npm run start` warns that `next start` does not support `output: standalone`; it
still serves the build. The Docker image runs the standalone server instead.

Then open http://localhost:3000.

