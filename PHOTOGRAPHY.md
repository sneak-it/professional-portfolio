# Photography galleries

Everything about getting photographs onto the site: where the files go, what happens to
them on the way out, and what is and is not stripped.

Blog and project images work differently and are covered in [CONTENT.md](CONTENT.md).

## How a gallery is assembled

Each gallery is two things in two places:

| What | Where | Holds |
| --- | --- | --- |
| The gallery entry | `content/portfolio/photography/<slug>.mdx` | Title, description, alt text |
| The photographs | `media/portfolio/photography/<slug>/` | The image files |

The folder names must match. The MDX filename becomes both the slug and the URL, so
`content/portfolio/photography/iceland.mdx` plus `media/portfolio/photography/iceland/`
serves at `/portfolio/photography/iceland`.

There is no list of images to maintain. The folder is scanned per request, so adding or
removing a file changes the gallery immediately, with no rebuild and no edit to the MDX.

## Adding a gallery

1. Create the MDX file, for example `content/portfolio/photography/iceland.mdx`:

   ```mdx
   ---
   title: 'Iceland'
   description: 'Ten days around the ring road.'
   date: '2026-08-01'
   alt: # optional, keyed by filename
     dsc_0142.jpg: 'Fog lifting off the ridge at sunrise'
     dsc_0187.jpg: 'Basalt columns at Reynisfjara, low tide'
   ---
   ```

2. Create `media/portfolio/photography/iceland/`.
3. Drop the photographs in. Straight off the camera or phone is fine; see
   [What happens to your photograph](#what-happens-to-your-photograph).
4. Load `/portfolio/photography/iceland`.

An empty folder is not an error. The gallery renders with "No images in this gallery yet."

### Frontmatter

| Field | Required | Purpose |
| --- | --- | --- |
| `title` | yes | Gallery heading, and the fallback alt text |
| `description` | yes | Subheading and meta description |
| `date` | no | Sorts the gallery within the Photography listing, newest first |
| `coverImage` | no | Card image for the listing. Defaults to the first file in the folder |
| `alt` | no | Per-file alt text, keyed by filename |
| `draft` | no | `true` hides it from listings while keeping the URL reachable |

The MDX body is ignored for galleries. There is nowhere on the page that renders it.

## Alt text

Write it. A photo with no `alt:` entry falls back to "Iceland, photo 3 of 24", which tells
a screen reader its position and nothing about the picture.

The keys are filenames exactly as they appear on disk, including the extension and case:

```mdx
alt:
  dsc_0142.jpg: 'Fog lifting off the ridge at sunrise'
  IMG_4471.HEIC: 'ignored, HEIC is not scanned'
```

Keys that match no file are ignored, and files that match no key get the positional
fallback, so a rename fails quietly. `npm run check:content` does not cross-check them.

## File formats

Scanned: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`. Case-insensitive.

Anything else in the folder is skipped, including **`.heic`**, which is what iPhones
produce by default unless "Most Compatible" is set in Camera settings. A HEIC dropped into
a gallery folder simply will not appear. Convert to JPEG first.

Animated GIFs keep their frames.

The extension only decides what the gallery *scans*. Stripping is decided by the file's
actual contents, so a photo saved with the wrong extension is still rebuilt and served
with the correct content type rather than handed over as-is.

## Ordering and the cover

Both the gallery order and the default cover come from the order the filesystem returns
the directory in, which is not guaranteed to be alphabetical. In practice:

- To control the cover, set `coverImage` explicitly.
- To control the order, do not rely on it. If sequence matters to you, say so and the scan
  can be sorted by filename.

## What happens to your photograph

Nothing under `media/` is served as a file. Every request goes through
[app/media/[...path]/route.ts](app/media/[...path]/route.ts), which rebuilds the image
from its pixels before sending it. Concretely, a photo off a phone:

| | Your file on disk | What a visitor receives |
| --- | --- | --- |
| EXIF (GPS, camera, serial, timestamps) | present | gone |
| XMP and IPTC blocks | present | gone |
| Colour profile (ICC) | present | kept |
| Orientation | an EXIF flag | applied to the pixels |
| Long edge | 6000px | at most 3840px |

The rebuild is the mechanism. Metadata is not filtered out block by block, it is simply
never copied into the new image, so there is no list of tags to keep up to date.

Two consequences worth knowing:

- **Orientation is baked in, not flagged.** Since the EXIF being dropped is where "which
  way up" normally lives, the pixels are rotated instead. Portraits stay portrait.
- **The original is not downloadable.** The full-resolution file never leaves the server.
  A direct link, a right-click save, or a Slack preview all get the capped, stripped copy.

Both routes that can reach an image are covered. `/media/...` strips as described, and
`/_next/image` reads through that same route, so even its passthrough cases (animated
images, or an optimizer failure) hand back bytes that were already stripped.

### What is not stripped

Be clear-eyed about the limits:

- **The picture itself.** If the frame shows a house number or a school uniform, stripping
  metadata changes nothing.
- **The filename.** It appears in the URL. `dsc_0142.jpg` says nothing;
  `back-garden-42-oak-street.jpg` says plenty.
- **Anything already published.** Copies that Slack, Google or the Internet Archive have
  already fetched are beyond reach, and a photo committed to git stays in the history.
- **SVG.** Passed through untouched. There is no EXIF in SVG, though an editor may leave a
  creator string in one.

## Adding photos to a running site

Compose bind-mounts `./media/portfolio/photography` read-only, creating it on the host on
first run, so copying a file in publishes it. No rebuild, no restart, no container write
access.

```bash
mkdir -p ./media/portfolio/photography/iceland
cp ~/Pictures/iceland/*.jpg ./media/portfolio/photography/iceland/
```

Only the per-gallery folder is yours to create; Compose makes everything above it.

Because the container cannot write to that mount, stripping happens on the way out rather
than in place, which is why a file dropped in this way is still safe.

`media/images/` is deliberately *not* mounted, so the shipped avatar and blog assets work
on a first run with an empty host tree. To supply your own, uncomment the `./media/images`
mount in `docker-compose.yml`; it replaces the shipped ones wholesale.

### Photographs are not committed

`media/portfolio/` is gitignored, so a clone of this repository contains no photographs
and every gallery renders empty until you add your own.

That is deliberate. Committing a photograph would publish the full-resolution original
that the route withholds, and git would keep it after any later unpublish. Back
photographs up somewhere that is not git.

A local `docker build .` still picks them up, since `.dockerignore` does not exclude
`media/`. Only a build from a clean checkout, which is what the release workflow does,
leaves them out.

## Checks

```bash
npm run check:content   # frontmatter: required fields, unknown keys, dates, cover paths
npm test                # includes the two guards below
```

Two tests in [tests/media.test.ts](tests/media.test.ts) exist to keep the guarantee true
rather than merely documented:

- **Nothing image-shaped in `public/`.** That directory *is* served verbatim by Next, so a
  photo there would bypass stripping entirely. Putting one there fails the build.
- **No committed image carries metadata.** `media/portfolio/` is gitignored, but anything
  else under `media/` can still be committed, a blog cover for instance. Stripping on the
  way out does not help if the original is also downloadable from the repository.

If the second one fails, strip that file before committing it.

## Replacing and removing

Removing a file removes it from the gallery on the next request.

Replacing a file **under the same name** needs more care. The response carries
`s-maxage=604800`, so a CDN may hold the old image for up to a week. Either give the new
file a new name, or purge that URL (for Cloudflare, see [CLOUDFLARE.md](CLOUDFLARE.md)).
Browsers revalidate hourly and the `ETag` covers same-name edits, so this is a CDN concern
rather than a visitor one.

## Troubleshooting

| Symptom | Cause |
| --- | --- |
| Gallery 404s | No MDX file at `content/portfolio/photography/<slug>.mdx` |
| "No images in this gallery yet" | Folder missing, empty, or named differently from the MDX file |
| One photo missing from an otherwise fine gallery | Unsupported extension (`.heic`, `.tif`, `.raw`, `.dng`), or an unreadable file. The server logs `Error reading image dimensions for …` |
| Listing card shows a gradient instead of a photo | `coverImage` points at a path with no file, and the folder is empty |
| Photo appears sideways | Report it. Orientation is applied server-side, so this would be a bug rather than a metadata problem |
| Old version of a replaced photo persists | CDN cache; see [Replacing and removing](#replacing-and-removing) |
| `unknown frontmatter key` from `check:content` | Only the fields in the table above are recognised |
