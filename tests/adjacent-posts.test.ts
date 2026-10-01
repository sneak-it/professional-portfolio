import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test, { after } from 'node:test';

// Own content tree, so the walk does not depend on how many posts content/ ships.
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'adjacent-'));
after(() => {
  fs.rmSync(root, { recursive: true, force: true });
});
fs.mkdirSync(path.join(root, 'blog'));
const posts: Array<[string, string, boolean]> = [
  ['oldest', '2024-01-01', false],
  ['middle', '2024-02-01', false],
  ['unlisted', '2024-02-15', true],
  ['newest', '2024-03-01', false],
];
for (const [slug, date, draft] of posts) {
  fs.writeFileSync(
    path.join(root, 'blog', `${slug}.mdx`),
    `---\ntitle: '${slug}'\ndate: '${date}'\ndraft: ${draft}\n---\n\nBody.\n`,
  );
}
process.env.CONTENT_DIR = root;
const { getAdjacentPosts } = await import('../lib/mdx.ts');

void test('getAdjacentPosts walks the published list in both directions', () => {
  const newest = getAdjacentPosts('newest');
  assert.equal(newest.next, undefined, 'newest post has no newer neighbour');
  assert.equal(newest.prev?.slug, 'middle', 'drafts are skipped');

  const middle = getAdjacentPosts('middle');
  assert.equal(middle.prev?.slug, 'oldest');
  assert.equal(middle.next?.slug, 'newest');

  const oldest = getAdjacentPosts('oldest');
  assert.equal(oldest.prev, undefined, 'oldest post has no older neighbour');
  assert.equal(oldest.next?.slug, 'middle');
});
