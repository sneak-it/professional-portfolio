# Docker deployment

Docker is the recommended way to run this site. The build uses Next.js standalone
output on a distroless base (no shell, no package manager).

## Image variants

Two variants are published from the same layers:

| Tag | User | Notes |
| --- | --- | --- |
| `:latest-nonroot`, `:<version>-nonroot`, `:dev-nonroot` | `nonroot` (uid 65532) | What `docker-compose.yml` runs. |
| `:latest`, `:<version>`, `:dev` | root (uid 0) | What a plain `docker build .` produces. |

Use the non-root variant with the shipped compose file. `cap_drop: ALL` strips
`DAC_OVERRIDE` from root as well, so root cannot write the cache volumes (owned by
uid 65532): every image request is optimized and every photo decoded again, and the
log fills with `EACCES` and `[media] cannot cache`. Uid 65532 reads the mounts
through their world-read bits, which a default umask sets. If a tree genuinely is
unreadable, the site renders empty and logs
`Cannot read content dir "<path>"`. Fix with `chmod -R a+rX content media`.

## Building manually

Pass `--target production-nonroot` for the image compose runs; without it you
get the root variant.

```bash
docker build --target production-nonroot -t portfolio-app .
docker run -p 3000:3000 \
  -e SITE_URL=https://your-domain \
  -v "$(pwd)/content:/app/content:ro" \
  -v "$(pwd)/media/portfolio/photography:/app/media/portfolio/photography:ro" \
  portfolio-app
```

Those are the same two mounts Compose uses. Add
`-v "$(pwd)/media/images:/app/media/images:ro"` only to replace the shipped avatar and blog
assets; it shadows them wholesale. Create each host path yourself before the first run, or
Docker creates it root-owned.

## Runtime vs build time

Everything in `.env.example` is read at process start, so `env_file` or `-e` is enough.
Two things are not, because Next serializes them into the build output:

- **Response headers, including the CSP** (`next.config.ts` `headers()`, baked into `.next/routes-manifest.json`).
- **Optimizable image paths** (`images.localPatterns`, baked into `.next/required-server-files.json`).

Changing either requires a rebuild, using a build `ARG` if the value varies per deployment.

This matters for `SITE_AVATAR_URL`. Images are same-origin only (no
`images.remotePatterns`, and the CSP sets `img-src 'self'`), so a remote URL will not
load. Point it at a path under `/media/images/`, and uncomment the `./media/images` mount
in `docker-compose.yml` so your file is there. That mount replaces the shipped assets
wholesale, so include a file for every path your content references. A path outside
`images.localPatterns` returns 400 from the optimizer while the page still returns 200,
so the portrait goes blank with no error.

## Caching

Content routes render per request, so edits and `SITE_*` changes take effect immediately
and every document request reaches the Node process. `next.config.ts` sends
`Cache-Control: s-maxage=300, stale-while-revalidate=600` on the pages worth caching.
Cloudflare ignores that header for HTML until a Cache Rule marks it eligible; see
[CLOUDFLARE.md](CLOUDFLARE.md), which is not optional if you run behind Cloudflare.

The generated brand images (`/brand/icon`, `/brand/apple-icon`, `/brand/opengraph-image`)
are cached far longer, since each request is a full rasterize. Their URLs carry a version
token derived from the identity and palette they draw, so a `SITE_*` change moves the URL
and takes effect immediately. Editing a renderer in `app/brand/` does not move the token,
and waits out the 24-hour `s-maxage` or a purge.

Compose keeps two named volumes: `images-cache` for Next's optimized images, and
`media-cache` for the stripped photos they are made from, one per file, replaced when
the file changes.
Both are safe to delete; each photo is rebuilt on its next request, one at a time.
Copies of deleted or renamed photos stay in `media-cache` until you delete it.
