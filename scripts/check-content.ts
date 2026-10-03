/**
 * Frontmatter linter for content/: `npm run check:content`. Catches what the
 * renderers tolerate silently — typo'd keys, empty titles, tags spelled two
 * ways. Errors exit 1; the rest is informational.
 */
import fs from 'fs';
import path from 'path';
import {
  contentDir,
  isDraft,
  listMdxSlugs,
  readMdxFile,
} from '../lib/content.ts';
import { mediaFilePath } from '../lib/image.ts';
import { PORTFOLIO_SECTIONS } from '../lib/portfolio.ts';
import { slugify } from '../lib/slug.ts';

interface Schema {
  /** Keys whose absence leaves something visibly blank or unsorted. */
  required: string[];
  known: string[];
  /** Frontmatter key holding a site-relative image path. */
  image: string;
  /** Only blog posts carry tags. */
  tags: boolean;
  /** Keys that must be lists of strings. */
  lists: string[];
  /** Keys that must be text; an empty key reads as absent. */
  texts: string[];
}

const BLOG: Schema = {
  required: ['title', 'date'],
  known: [
    'title',
    'date',
    'updated',
    'image',
    'tags',
    'excerpt',
    'readTime',
    'draft',
    'toc',
  ],
  image: 'image',
  tags: true,
  lists: [],
  texts: ['image', 'excerpt', 'readTime'],
};

const PROJECT: Schema = {
  required: ['title', 'description'],
  known: [
    'title',
    'description',
    'date',
    'coverImage',
    'tech',
    'link',
    'github',
    'features',
    'challenges',
    'draft',
  ],
  image: 'coverImage',
  tags: false,
  lists: ['tech', 'features'],
  texts: ['coverImage', 'link', 'github', 'challenges'],
};

const GALLERY: Schema = {
  required: ['title', 'description'],
  known: [
    'title',
    'description',
    'cardDescription',
    'date',
    'coverImage',
    'alt',
    'draft',
  ],
  image: 'coverImage',
  tags: false,
  lists: [],
  texts: ['coverImage', 'cardDescription'],
};

/** More than this on one post and the tags stop narrowing anything. */
const MAX_TAGS = 6;

const errors: string[] = [];
const notes: string[] = [];

const error = (file: string, message: string) =>
  errors.push(`${file}: ${message}`);

const isStringList = (value: unknown) =>
  Array.isArray(value) && value.every((v) => typeof v === 'string');

/** A value the page drops because it is not text. */
function checkText(file: string, key: string, value: unknown) {
  if (value == null || typeof value === 'string') return;
  const got = Array.isArray(value)
    ? 'a list'
    : typeof value === 'object'
      ? 'nested keys'
      : `a ${typeof value} (quote it)`;
  error(file, `${key} must be text, not ${got}`);
}

/** Every tag spelling seen, by slug, with the files that used it. */
const spellings = new Map<string, Map<string, string[]>>();

function checkDate(file: string, key: string, value: unknown) {
  if (value === undefined) return;
  if (typeof value !== 'string') {
    error(file, `${key} must be a quoted string, got ${typeof value}`);
    return;
  }
  if (Number.isNaN(Date.parse(value))) {
    error(file, `${key} "${value}" is not a parseable date`);
  }
}

function checkTags(file: string, value: unknown) {
  if (value === undefined) return;
  if (!Array.isArray(value)) {
    error(file, `tags must be a list, got ${typeof value}`);
    return;
  }
  const names = value.filter((v) => typeof v === 'string');
  if (names.length !== value.length) {
    error(file, 'tags contains a non-string entry');
  }
  if (names.length > MAX_TAGS) {
    notes.push(`${file}: ${names.length} tags (over ${MAX_TAGS})`);
  }
  for (const name of names) {
    const slug = slugify(name);
    if (slug === '') {
      error(file, `tag "${name}" has no slug-able characters`);
      continue;
    }
    const byName = spellings.get(slug) ?? new Map<string, string[]>();
    byName.set(name, [...(byName.get(name) ?? []), file]);
    spellings.set(slug, byName);
  }
}

function checkFile(dir: string, slug: string, schema: Schema) {
  const file = path.join(dir, `${slug}.mdx`);
  // No `required` here, so a bad field is reported and the file still reads.
  const parsed = readMdxFile(dir, slug);
  if (parsed === null) {
    error(file, 'unreadable or unparseable');
    return;
  }
  const { data } = parsed;

  for (const key of schema.required) {
    const value = data[key];
    if (typeof value !== 'string' || value.trim() === '') {
      error(file, `missing or empty required field "${key}"`);
    }
  }

  for (const key of Object.keys(data)) {
    if (!schema.known.includes(key)) {
      error(file, `unknown frontmatter key "${key}"`);
    }
  }

  checkDate(file, 'date', data.date);
  checkDate(file, 'updated', data.updated);

  for (const key of ['draft', 'toc']) {
    const value = data[key];
    if (value !== undefined && typeof value !== 'boolean') {
      error(
        file,
        `${key} must be a boolean, got ${typeof value} (${JSON.stringify(value)})`,
      );
    }
  }

  const src = data[schema.image];
  if (typeof src === 'string' && src.trim() !== '') {
    const full = mediaFilePath(src);
    if (full === null) {
      error(file, `${schema.image} "${src}" is not a site-relative media path`);
    } else if (!fs.existsSync(full)) {
      error(file, `${schema.image} "${src}" has no file under media/`);
    }
  }

  for (const key of schema.lists) {
    const value = data[key];
    if (value !== undefined && !isStringList(value)) {
      error(file, `${key} must be a list of strings`);
    }
  }
  for (const key of schema.texts) checkText(file, key, data[key]);

  if (schema.tags) checkTags(file, data.tags);

  if (isDraft(data)) {
    const scheduled = data.draft !== true;
    notes.push(
      `${file}: ${scheduled ? `scheduled for ${String(data.date)}` : 'draft'}`,
    );
  }
}

/** The about.mdx keys `getAbout` reads as text. */
const ABOUT_TEXTS = [
  'description',
  'skillsHeading',
  'skillsBlurb',
  'interestsHeading',
  'interestsBlurb',
];

/** about.mdx: values and entries the About page would skip or show empty. */
function checkAbout() {
  const file = path.join(contentDir(), 'about.mdx');
  if (!fs.existsSync(file)) return;
  const parsed = readMdxFile(contentDir(), 'about');
  if (parsed === null) {
    error(file, 'unreadable or unparseable');
    return;
  }
  const { data } = parsed;
  for (const key of Object.keys(data)) {
    if (![...ABOUT_TEXTS, 'skills', 'interests'].includes(key)) {
      error(file, `unknown frontmatter key "${key}"`);
    }
  }
  for (const key of ABOUT_TEXTS) checkText(file, key, data[key]);
  for (const key of ['skills', 'interests']) {
    const value = data[key];
    if (value === undefined) continue;
    if (!Array.isArray(value)) {
      error(file, `${key} must be a list, got ${typeof value}`);
      continue;
    }
    value.forEach((entry: unknown, i) => {
      const item = (entry ?? {}) as Record<string, unknown>;
      if (typeof item.name !== 'string' || item.name.trim() === '') {
        error(file, `${key} entry ${i + 1} has no name`);
      } else if (key === 'skills' && !isStringList(item.items)) {
        error(file, `skills entry ${i + 1}: items must be a list of strings`);
      } else if (key === 'interests') {
        checkText(file, `interests entry ${i + 1}: blurb`, item.blurb);
      }
    });
  }
}

function checkTagVocabulary() {
  // `next-js` and `nextjs` slug apart, so report the spellings together.
  const collapsed = new Map<string, string[]>();
  for (const slug of spellings.keys()) {
    const key = slug.replace(/-/g, '');
    collapsed.set(key, [...(collapsed.get(key) ?? []), slug]);
  }
  for (const [key, slugs] of collapsed) {
    if (slugs.length > 1) {
      errors.push(
        `tags: ${slugs.map((s) => `"${s}"`).join(' and ')} both reduce to "${key}" — pick one spelling`,
      );
    }
  }

  for (const [slug, byName] of spellings) {
    if (byName.size > 1) {
      const where = [...byName]
        .map(([name, files]) => `"${name}" (${files.length})`)
        .join(', ');
      errors.push(`tags: "${slug}" is spelled ${byName.size} ways: ${where}`);
    }
  }
}

function reportTagVocabulary() {
  const counts = [...spellings]
    .map(([slug, byName]) => ({
      slug,
      name: [...byName.keys()][0] ?? slug,
      count: [...byName.values()].flat().length,
    }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  if (counts.length === 0) return;
  console.log(`\nTag vocabulary (${counts.length}):`);
  for (const { name, slug, count } of counts) {
    console.log(`  ${String(count).padStart(3)}  ${name}  (${slug})`);
  }
  const singles = counts.filter((t) => t.count === 1);
  if (singles.length > 0) {
    console.log(
      `\n${singles.length} single-post tag(s), merge candidates: ${singles
        .map((t) => t.name)
        .join(', ')}`,
    );
  }
}

const blogDir = contentDir('blog');
for (const slug of listMdxSlugs(blogDir)) checkFile(blogDir, slug, BLOG);

for (const section of PORTFOLIO_SECTIONS) {
  const dir = path.join(contentDir('portfolio'), section.slug);
  const schema = section.type === 'gallery' ? GALLERY : PROJECT;
  for (const slug of listMdxSlugs(dir)) checkFile(dir, slug, schema);
}

checkAbout();

checkTagVocabulary();

if (notes.length > 0) {
  console.log('Notes:');
  for (const note of notes) console.log(`  ${note}`);
}

reportTagVocabulary();

if (errors.length > 0) {
  console.error(`\n${errors.length} error(s):`);
  for (const e of errors) console.error(`  ${e}`);
  process.exitCode = 1;
} else {
  console.log('\nNo problems found.');
}
