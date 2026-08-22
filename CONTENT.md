# Content management

All content is MDX under `content/`. Under Docker Compose, `content/` and `public/` are
bind-mounted read-only, so new and edited files are served immediately with no rebuild.

## Special pages

Three files at the top of `content/` hold the copy for the fixed pages. Each is optional:
a missing or unparseable file falls back to built-in defaults, as does any individual
frontmatter field. In all three, the MDX body is the page's prose.

### `content/home.mdx`

The homepage hero.

| Field | Purpose | Default |
| --- | --- | --- |
| `eyebrow` | Small line above the headline. | `Building things, on and off the clock` |
| `headline` | Static first word of the hero. | `Creating` |
| `words` | List cycled by the typewriter after the headline. An empty list falls back. | `Experiences`, `Opportunities`, `Connections`, `Solutions` |

Body: the bio paragraph under the hero.

### `content/about.mdx`

| Field | Purpose | Default |
| --- | --- | --- |
| `description` | Meta description. | Derived from `SITE_NAME` |
| `skillsHeading` | Heading over the skills grid. | `Technical Arsenal` |
| `skillsBlurb` | Line under that heading. | `The tools I reach for.` |
| `skills` | Grouped skill list; see below. | none (section empty) |
| `interestsHeading` | Heading over the interests grid. | `Off the Clock` |
| `interestsBlurb` | Line under that heading. | `What I get up to away from a keyboard.` |
| `interests` | Interest cards; see below. | none (section empty) |

```mdx
skills:
  - name: 'Cloud & Infrastructure'
    icon: ops            # ops | network | data | business (unknown falls back to a wrench)
    items:
      - 'Docker'
      - 'Cloudflare'
interests:
  - name: 'Homelab & Self-Hosting'
    icon: server         # server | bot | gamepad | camera | wrench | sprout
    blurb: 'One or two sentences.'
```

Body: the bio paragraphs.

### `content/contact.mdx`

| Field | Purpose | Default |
| --- | --- | --- |
| `heading` | First part of the page heading. | `Say` |
| `highlight` | Second part, rendered in the accent gradient. | `hello` |
| `description` | Meta description. | Derived from `SITE_NAME` |

Body: the intro paragraph. The email card only appears when `SITE_EMAIL` is set.

## Checking content

```bash
npm run check:content
```

Lints every blog post and portfolio entry (the special pages above are not checked):
missing required fields, unknown keys (a typo'd `catgeory:` otherwise does nothing),
unparseable dates, a `draft` that is the string `'true'` rather than a boolean, a cover
image with no file under `public/`, and colliding tag spellings. Also prints the full tag
vocabulary with counts. Exits non-zero on error.

## Drafts and scheduled posts

`draft: true` in the frontmatter of any `.mdx` file drops it from the listings, section
counts, and sitemap, but keeps it reachable at its own URL with `noindex, nofollow`.

A future `date` does the same, so a post publishes itself once that date arrives. Nothing
is scheduled server-side: each request re-reads the file. The sitemap and RSS feed lag by
`SITEMAP_CACHE_TTL_MS`, so check the page rather than `sitemap.xml` when confirming.

## Blog posts

1. Create a `.mdx` file in `content/blog/`. The filename becomes the URL slug.
2. Add frontmatter. Only `title` and `date` are required:

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

   Optional: `excerpt` and `readTime` (derived from the body when omitted),
   `updated: 'YYYY-MM-DD'`, `draft: true`, and `toc: true | false` to force or suppress
   the table of contents (shown by default at four or more `##`/`###` headings).

3. Write the body in GitHub-Flavored Markdown: tables, footnotes, task lists,
   `~~strikethrough~~`, bare-URL autolinks.

`content/blog/authoring-reference.mdx` is a draft post exercising every frontmatter
field, Markdown feature, and component on one page, including the ones that deliberately
do not render.

Components available in the body: `<Callout type="note|tip|warn" title="…">`,
`<Figure src alt caption />`, plus `Container`, `Surface`, `CoverCard`, `CoverImage`,
`IconBadge`, `EmptyState`, `PostMeta`. Raw HTML is not a feature: `<script>`, `<iframe>`,
`<input>` and friends are stripped, images must be same-origin, links are limited to
http/https/mailto.

### Tags and RSS

Tags are the only taxonomy. `/blog?tag=<slug>` filters the listing to one tag, and the
same list becomes the post's `keywords` and its RSS `<category>` entries. The `/blog`
filter chip expands to the full tag list with post counts.

Published posts are served as RSS at `/feed.xml`, linked from every page's `<head>`.
Drafts and future-dated posts are excluded. Like the sitemap, the item list is cached for
`SITEMAP_CACHE_TTL_MS`.

Run `npm run check:content` before committing: it catches a tag spelled two ways
(`Next.js` vs `NextJS`), which is what fragments a vocabulary over a few dozen posts.

## Portfolio

Three sections under `content/portfolio/<section>/`:

| Section | Folder | Type |
| --- | --- | --- |
| Technology Consulting | `technology-consulting/` | Project write-up |
| Open Source | `open-source/` | Project write-up |
| Photography | `photography/` | Image gallery |

Placeholder entries (`example-engagement.mdx`, `example-project.mdx`) are templates:
copy one, rename it, edit.

### Adding a project

1. Create a `.mdx` file in the matching section folder. The filename becomes the slug.
2. Add frontmatter. The detail page only renders buttons/lists for fields you fill in:

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

3. Write the narrative in the MDX body.

### Adding a photography gallery

1. Create a `.mdx` file in `content/portfolio/photography/` (e.g. `my-trip.mdx`).
2. Add frontmatter:

   ```mdx
   ---
   title: 'My Trip'
   description: 'Gallery description.'
   coverImage: 'https://example.com/cover.jpg' # optional; falls back to the first image
   alt: # optional; screen-reader description per image file
     dsc_0142.jpg: 'Fog lifting off the ridge at sunrise'
   ---
   ```

   Images without an `alt:` entry fall back to "<gallery title>, photo N of M". That is a
   position, not a description, so write real `alt` text for photos that carry meaning.

3. Create `public/portfolio/photography/<same-name>/`.
4. Drop `.jpg`, `.jpeg`, `.png`, `.webp`, or `.gif` files inside. Dimensions are read
   automatically and the images render with a lightbox. An empty folder shows placeholders.
