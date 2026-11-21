# Content management

All content is MDX under `content/`, and images live under `media/`. Under Docker
Compose `./content` and `./media` are bind-mounted read-only, so new and edited files are
served immediately with no rebuild. Each mount replaces what the image ships wholesale, so
copy in any shipped image your content still uses, such as the avatar placeholder.

## Special pages

Files at the top of `content/` hold the copy for the fixed pages. Each is optional:
a missing or unparseable file falls back to built-in defaults, as does any individual
frontmatter field. In home, about, and contact, the MDX body is the page's prose.

### `content/home.mdx`

The homepage hero.

| Field | Purpose | Default |
| --- | --- | --- |
| `eyebrow` | Small line above the headline, and the page's main heading, so your name fits best. | `Portfolio and blog` |
| `headline` | Static first word of the hero. | `Creating` |
| `words` | List cycled by the typewriter after the headline. An empty list falls back. | `Experiences`, `Opportunities`, `Connections`, `Solutions` |

Body: the bio paragraph under the hero.

### `content/about.mdx`

| Field | Purpose | Default |
| --- | --- | --- |
| `heading` | Page heading. | `About Me` |
| `description` | Meta description. | Derived from `SITE_NAME` |
| `skillsHeading` | Heading over the skills grid. | `Skills` |
| `skillsBlurb` | Line under that heading. | `The tools I use most.` |
| `skills` | Grouped skill list; see below. | none (section empty) |
| `interestsHeading` | Heading over the interests grid. | `Interests` |
| `interestsBlurb` | Line under that heading. | `What I do outside work.` |
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
    icon: server         # server | bot | gamepad | camera | wrench | sprout (unknown falls back to a wrench)
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

### `content/not-found.mdx`

The 404 page, under the large `404`. Frontmatter only; the body is ignored.

| Field | Purpose | Default |
| --- | --- | --- |
| `title` | Heading. | `Page not found.` |
| `message` | Line under the heading. | `The page you are looking for cannot be found.` |

### `content/blog.mdx`

The Blog page. Frontmatter only; the body is ignored.

| Field | Purpose | Default |
| --- | --- | --- |
| `description` | Meta description for `/blog`. | None (line left out) |

### `content/portfolio.mdx`

The Portfolio page and its three sections. Frontmatter only; the body is ignored.
`<slug>` is a section folder: `technology-consulting`, `photography`, or `open-source`.

| Field | Purpose | Default |
| --- | --- | --- |
| `description` | Line under the Portfolio heading, and its meta description. | None (line left out) |
| `sections.<slug>.name` | Section heading, hub card title, and gallery back button. | The folder name in title case |
| `sections.<slug>.description` | Line under the section heading, and its meta description. | None |
| `sections.<slug>.note` | A short line at the bottom of the section page, and of every gallery for `photography`; Markdown links work. Point `SITE_PHOTO_LICENSE_URL` at a section page whose note states your photo terms. | None |

## Checking content

```bash
npm run check:content
```

Lints every blog post, every portfolio entry, `about.mdx`, `blog.mdx`, and `portfolio.mdx`
(the other special pages above are not checked): missing required fields, unknown keys (a typo'd `catgeory:`
otherwise does nothing), unparseable dates, a `draft` that is the string `'true'` rather
than a boolean, a list where text belongs or text where a list belongs (the page would
drop the value), About skills and interests with no `name`, a cover image with no file
under `media/`, and colliding tag spellings. Also prints the full tag vocabulary with
counts. Exits non-zero on error.

## Drafts and scheduled posts

`draft: true` in the frontmatter of any `.mdx` file drops it from the listings, section
counts, and sitemap, but keeps it reachable at its own URL with `noindex, nofollow`.

A future `date` does the same, so a post publishes itself once that date arrives. Nothing
is scheduled server-side: each request re-reads the file.

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
   image: '/media/images/blog/cover.jpg'
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

Charts and diagrams render on the server and follow the theme toggle: `<Stats>` with
`<Stat value label note />` tiles, `<BarChart title note orientation hideTable>` with
`<Bar label value show />` and `<Marker after label note />` children, `<Timeline>` with
`<Milestone date title>` entries, and ` ```mermaid ` fences (flowchart, state, sequence,
class, and ER). The "Charts and diagrams" section of the authoring reference shows each
one, with its syntax.

Code fences are highlighted on the server in both themes and get a copy button. `{1,3-4}`
after the language highlights those lines, and a `[!code ++]` or `[!code --]` comment marks
a line as added or removed. An unknown language renders as plain text. `##` and `###`
headings show a `#` link on hover.

### Tags and RSS

Tags are the only taxonomy. `/blog?tag=<slug>` filters the listing to one tag, and the
same list becomes the post's `keywords` and its RSS `<category>` entries. The `/blog`
filter chip expands to the full tag list with post counts.

Published posts are served as RSS at `/feed.xml`, linked from every page's `<head>`.
Drafts and future-dated posts are excluded.

Run `npm run check:content` before committing: it catches a tag spelled two ways
(`Next.js` vs `NextJS`), which is what fragments a vocabulary over a few dozen posts.

## Portfolio

Three sections under `content/portfolio/<section>/`:

| Default name | Folder | Type |
| --- | --- | --- |
| Technology Consulting | `technology-consulting/` | Project write-up |
| Open Source | `open-source/` | Project write-up |
| Photography | `photography/` | Image gallery |

Section names and descriptions come from `content/portfolio.mdx`.

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
   updated: 'YYYY-MM-DD' # optional: your last real change, for search engines
   coverImage: '/media/images/my-project.jpg' # same-origin only, under media/
   tech: ['TypeScript', 'Node.js']
   github: 'https://github.com/you/my-project' # optional
   link: 'https://my-project.dev' # optional
   linkLabel: 'Read the Docs' # optional button text for link, default "Visit Site"
   ---
   ```

   A bare year (`date: '2019'`) is fine; the sitemap only uses dates given in full as
   `YYYY-MM-DD`.

   A cover is cropped to fill its card. One that is transparent, much wider or taller
   than its card, or under 640 px wide is shown whole instead: on a light panel if
   transparent, otherwise over a blurred copy of itself. It is never drawn larger than
   its own pixels, so for a logo, use an SVG: it stays sharp at any size.

3. Write the body: features, the story of the work, and anything else, laid out as
   [cards](#cards).

### Cards

A project's body is laid out as cards. Put cards side by side with `<CardRow>`, and
title each `<Card>` however you like:

```mdx
<CardRow>
<Card title="Key Features" checks>

- Runs anywhere Docker does
- Ships as one binary

</Card>
<Card title="Overview">

A longer description, with **bold**, [links](https://example.com), and images.

</Card>
</CardRow>
```

- Cards in a row sit side by side on wide screens and stack on phones. A third card
  starts a new line, and an odd last card spans the full width.
- A `<Card>` outside a row spans the full width. `title` is optional.
- `checks` turns the card's bullet list into check marks; without it, lists keep
  plain bullets.
- Text outside any card gets a full-width card of its own, so a body with no cards
  shows as one card.
- Anything that works in a blog post works in a card: images, `<Figure>`,
  `<Callout>`, code blocks, tables, `###` headings. Footnotes are the exception:
  their list renders below the cards, outside any card.
- `{` and `<` are MDX syntax. Write `\{` and `\<` when you mean the characters.

`content/portfolio/open-source/example-project.mdx` uses all of the above.

### Adding a photography gallery

Galleries have their own document: [PHOTOGRAPHY.md](PHOTOGRAPHY.md). It covers the MDX
file and its matching `media/` folder, alt text, supported formats, and what the server
strips from a photograph before serving it.
