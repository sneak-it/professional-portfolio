# Caching this site behind Cloudflare

Every content route renders per request (`export const dynamic = 'force-dynamic'`
in the page files), so content edits and runtime `SITE_*` configuration take
effect immediately with no rebuild and no revalidation window. The cost is that
each document request reaches the Node process. A shared cache in front of the
origin removes that cost for repeat traffic without giving up the per-request
rendering.

This guide sets that up on Cloudflare. It takes one Cache Rule and about five
minutes. Everything on the origin side is already done.

## What the repo already sends

`next.config.ts` sets this header on the pages worth caching:

```
Cache-Control: s-maxage=300, stale-while-revalidate=600
```

covering `/`, `/about`, `/contact`, `/blog`, `/blog/<slug>`, `/portfolio`,
`/portfolio/<section>`, `/portfolio/<section>/<slug>`, `/robots.txt`, and
`/sitemap.xml`.

The generated images get a longer one, since each origin hit is a full
rasterize:

```
Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800
```

covering `/brand/icon`, `/brand/apple-icon`, and `/brand/opengraph-image`. A TTL
that long is only safe because those URLs carry a version token derived from the
identity and palette they draw (`BRAND_VERSION` in `lib/site.ts`), so a `SITE_*`
change moves the URL instead of leaving a stale image behind it. An old token
still renders current bytes, so a cached page holding a stale href degrades to
old-but-valid rather than breaking.

The stripped images under `/media/` send their own header, set in
`app/media/[...path]/route.ts`:

```
Cache-Control: public, max-age=3600, s-maxage=604800, stale-while-revalidate=604800
```

Every origin hit there is a re-encode (that is what removes the EXIF), so the
shared TTL matches `images.minimumCacheTTL` and lets the CDN absorb direct hits,
share-card scrapers and crawlers. Unlike `/brand/`, these URLs carry no version
token, so replacing a file under the same name needs a purge; the `ETag` means a
revalidating client costs a `stat` rather than a re-encode.

Three things to note about these headers:

- `s-maxage` applies to shared caches only. On the pages there is no `max-age`,
  so browsers keep revalidating and a visitor never sees a stale document from
  their own cache. The images do set `max-age`: they are safe for a browser to
  hold, and re-rendering a favicon on every navigation is pure waste.
- Without these, Next sends `private, no-cache, no-store` on the page routes and
  `public, max-age=0, must-revalidate` on the images, so neither is cacheable by
  a CDN.
- `/api/health` is deliberately excluded so the container healthcheck is never
  answered from a cache.

Hashed assets under `/_next/static/` are immutable and are already cached by
Cloudflare with no configuration.

## Why a Cache Rule is required

Cloudflare decides what to cache by file extension by default, and HTML is not
on that list. It will ignore the `s-maxage` header on a page response until you
explicitly mark HTML as eligible for cache. The header is necessary but not
sufficient; the rule below is the other half.

## Step by step

1. **Proxy the hostname.** In **DNS**, confirm the record for your domain has
   the orange cloud enabled (Proxied, not DNS only). Traffic that bypasses the
   proxy cannot be cached.

2. **Open Cache Rules.** Dashboard, then **Caching** and **Cache Rules**, then
   **Create rule**. Cache Rules are available on the free plan.

3. **Name it** something you will recognize later, for example
   `Cache HTML documents`.

4. **Set the match expression.** Use the expression editor and paste:

   ```
   not (http.request.uri.path starts_with "/api/")
   ```

   The site has no cookies, no authentication, and no forms, so every other
   response is identical for every visitor and safe to share. Excluding `/api/`
   keeps the health endpoint and any future API route uncached.

5. **Set cache eligibility** to **Eligible for cache**.

6. **Set Edge TTL** to **Use cache-control header if present**. This is the
   important one: it makes Cloudflare honor the 5 minutes the origin sends
   instead of applying a default of its own. Do not pick "Ignore cache-control
   header and use this TTL" unless you intend to override the origin.

7. **Set Browser TTL** to **Respect origin TTL**.

8. **Deploy the rule** and wait a few seconds for it to propagate.

## Verify

Request the same page twice and watch the `cf-cache-status` header:

```bash
curl -sI https://yourdomain.tld/blog/<slug> | grep -i 'cf-cache-status\|cache-control'
curl -sI https://yourdomain.tld/blog/<slug> | grep -i 'cf-cache-status'
```

The first should report `MISS` and the second `HIT`. Confirm the origin header
is present too:

```
cache-control: s-maxage=300, stale-while-revalidate=600
```

Check that the exclusion works as well. This one must never be cached:

```bash
curl -sI https://yourdomain.tld/api/health | grep -i cf-cache-status
```

### Reading `cf-cache-status`

| Value | Meaning |
| --- | --- |
| `HIT` | Served from the edge. The origin was not touched. |
| `MISS` | Not in the edge cache; fetched from the origin and stored. |
| `EXPIRED` | Was cached, TTL elapsed, refetched from the origin. |
| `STALE` | Served stale while revalidating in the background. Expected inside the `stale-while-revalidate` window. |
| `DYNAMIC` | Cloudflare considered the response ineligible. If you see this on an HTML page, the Cache Rule is not matching. |
| `BYPASS` | Something explicitly told Cloudflare not to cache, usually a `no-store` from the origin. |

## What this changes

With the rule live, a burst on one URL collapses to roughly one origin request
per 5 minutes per URL, so the container's CPU stops being the limit on how much
traffic the site can absorb. Measured without a cache, the origin saturates
around 370 requests per second on a developer machine and roughly 145 under the
`cpus: '0.5'` limit in `docker-compose.yml`, degrading by queueing rather than
by erroring.

The trade-off is staleness at the edge. After a content edit, a cached page can
be up to 5 minutes behind, plus up to 10 minutes more if
`stale-while-revalidate` serves a stale copy while refreshing. Pages nobody has
requested are unaffected, and the origin itself is always current. To publish
sooner than that, purge the URL; see below.

## Adjusting the freshness window

Edit the `Cache-Control` value in the `headers()` block of `next.config.ts` and
redeploy. Lower `s-maxage` (for example `s-maxage=10`) for fresher content and
less burst protection; raise it for the opposite. No Cloudflare change is needed
when you do, because the rule defers to the origin header.

To publish a change immediately, purge the affected URL in **Caching** and
**Configuration**, using **Custom Purge** by URL, or **Purge Everything** for a
content-wide update. The `/brand/` images need no purge after a `SITE_*` change,
because the URL itself moves; they do need one after an edit to a renderer in
`app/brand/`, which the token does not cover.

## Notes

- Cloudflare ignores `Vary` other than `Accept-Encoding`, and these responses
  carry `Vary: rsc, next-router-state-tree, ...`. Next works around this by
  putting an `_rsc` query parameter in the URL of React Server Component
  requests, so document responses and payload responses land on separate cache
  keys. No configuration is needed, but it is worth knowing if you ever debug a
  page that renders as raw payload text.
- Any caching reverse proxy works here, not just Cloudflare. nginx
  (`proxy_cache` with `proxy_cache_use_stale updating`), Varnish, and Caddy all
  honor `s-maxage` and `stale-while-revalidate`. Only the dashboard steps above
  are Cloudflare-specific.
