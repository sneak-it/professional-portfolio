# Professional Portfolio

A modern, highly polished personal portfolio website.

## Features

- **MDX Blog**: Write blog posts using Markdown and React components.
- **Unified Portfolio**: A single Portfolio hub with three sections — Technology Consulting, Open Source, and Photography — all driven by MDX.
- **Auto-discovered Galleries**: Photography galleries build their image lists automatically from the filesystem, with a scrollable layout and lightbox.
- **Incremental content**: New content is picked up via ISR — drop in a file and it appears without a rebuild.
- **Fully Responsive**: Optimized for all screen sizes.
- **Light/Dark/System Mode Support**: Color scheme adapts to user preference, ability to switch to light and dark mode.
- **Docker Ready**: Ships a hardened multi-stage `Dockerfile` and `docker-compose.yml` for the preferred deployment path.

## Deployment (Docker)

Docker is the recommended way to run this site. The build uses Next.js standalone output on a distroless base (no shell, no package manager), so the runtime image is small and self-contained.

Two image variants are published from the same layers:

| Tag | User | Notes |
| --- | --- | --- |
| `:latest`, `:<version>`, `:dev` | root (uid 0) | Default. What a plain `docker build .` produces. |
| `:latest-nonroot`, `:<version>-nonroot`, `:dev-nonroot` | `nonroot` (uid 65532) | Hardened variant used by `docker-compose.yml`. |

### Using Docker Compose (recommended)

1. Create the content/image directories and make them traversable by the container user (uid `65532`). Skip this if you switch the compose file to the root `:latest` image:

   ```bash
   mkdir -p public/portfolio/photography
   chmod o+rx content content/blog content/portfolio public/portfolio public/portfolio/photography
   ```

2. Copy the docker-compose.yml available in the root of the repository.

3. Start the container:

   ```bash
   docker compose up -d
   ```

4. The app will be available at `http://localhost:3000`.

`content/` and `public/portfolio/` are mounted read-only into the container (see `docker-compose.yml`), so you can add or edit blog posts, projects, and photos on the host and they are served immediately — no rebuild required. The compose file also sets a healthcheck (`/api/health`), resource limits, and hardened security options.

To set the canonical production URL (used for Open Graph cards, the sitemap, robots.txt, and JSON-LD), set `SITE_URL` (no trailing slash) as a **runtime** environment variable. It is read when the container starts, so the same prebuilt image works under any domain — no rebuild required. In `docker-compose.yml` it is set under `environment:`; edit it to your own domain (unset falls back to `http://localhost:3000`).

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
