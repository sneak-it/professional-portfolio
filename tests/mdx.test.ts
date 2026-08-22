import assert from 'node:assert/strict';
import test from 'node:test';
import { getAllPostMeta, getPostsByTag, getTags } from '../lib/mdx.ts';
import { slugify } from '../lib/slug.ts';

// Runs against the real content/ tree, so these assert invariants rather than
// literal counts: a new post must not be able to break the suite.

void test('every post has an array of tags', () => {
  for (const post of getAllPostMeta()) {
    assert.ok(
      Array.isArray(post.meta.tags),
      `${post.slug} tags is not an array`,
    );
    for (const tag of post.meta.tags) assert.equal(typeof tag, 'string');
  }
});

void test('getTags returns unique, non-empty, count-sorted slugs', () => {
  const tags = getTags();
  const slugs = tags.map((t) => t.slug);
  assert.equal(new Set(slugs).size, slugs.length, 'duplicate slug');
  for (const tag of tags) {
    assert.notEqual(tag.slug, '');
    assert.equal(tag.slug, slugify(tag.name));
    assert.ok(tag.count >= 1);
  }
  for (const [i, cur] of tags.entries()) {
    const prev = tags[i - 1];
    if (!prev) continue;
    assert.ok(
      prev.count > cur.count ||
        (prev.count === cur.count && prev.name.localeCompare(cur.name) <= 0),
      `${prev.name} should not sort before ${cur.name}`,
    );
  }
});

void test('each tag count matches the posts that tag returns', () => {
  for (const tag of getTags()) {
    assert.equal(
      getPostsByTag(tag.slug).length,
      tag.count,
      `count mismatch for ${tag.slug}`,
    );
  }
});

void test('getPostsByTag returns posts that actually carry the tag', () => {
  const tag = getTags()[0];
  assert.ok(tag, 'content/ has no tagged posts to test against');
  for (const post of getPostsByTag(tag.slug)) {
    assert.ok(post.meta.tags.some((name) => slugify(name) === tag.slug));
  }
});

void test('getPostsByTag is empty for an unknown slug', () => {
  assert.deepEqual(getPostsByTag('definitely-not-a-tag'), []);
  assert.deepEqual(getPostsByTag(''), []);
});

void test('tag views never include drafts', () => {
  const published = new Set(getAllPostMeta().map((p) => p.slug));
  for (const tag of getTags()) {
    for (const post of getPostsByTag(tag.slug)) {
      assert.ok(published.has(post.slug), `${post.slug} is not published`);
    }
  }
});
