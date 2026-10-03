import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test, { after } from 'node:test';
import { fileURLToPath } from 'node:url';

// Hand-typed frontmatter slips that must not throw at render.
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'shapes-'));
after(() => {
  fs.rmSync(root, { recursive: true, force: true });
});
const projects = path.join(root, 'portfolio', 'open-source');
fs.mkdirSync(projects, { recursive: true });
fs.writeFileSync(
  path.join(projects, 'typo.mdx'),
  "---\ntitle: 'Typo'\ndescription: 'x'\ntech: TypeScript\nfeatures: one\nlink: 42\nchallenges:\n  - 'Problem A'\n  - 'Problem B'\n---\nBody.\n",
);
fs.writeFileSync(
  path.join(root, 'about.mdx'),
  "---\nskillHeading: 'Toolbox'\ninterestsHeading: 'Outside work'\nskills:\n  - name: 'Ops'\n    icon: ops\n    item:\n      - 'Docker'\n  - just a string\n  - null\ninterests:\n  - icon: server\n    blurb: 'no name'\n  - name: 'Homelab'\n    icon: server\n    blurb:\n      - 'a list'\n---\nBio.\n",
);
fs.mkdirSync(path.join(root, 'blog'));
fs.writeFileSync(
  path.join(root, 'blog', 'post.mdx'),
  "---\ntitle: 'Post'\ndate: '2026-01-01'\nimage:\n  src: '/media/x.png'\n  alt: 'x'\n---\nBody.\n",
);
process.env.CONTENT_DIR = root;
const { getProjectItems } = await import('../lib/portfolio.ts');
const { getAbout } = await import('../lib/about.ts');
const { getAllPostMeta } = await import('../lib/mdx.ts');

void test('project list fields that are not lists become empty lists', () => {
  const [item] = getProjectItems('open-source');
  assert.deepEqual(item?.tech, []);
  assert.deepEqual(item?.features, []);
  assert.equal(item?.link, undefined);
});

void test('about skills and interests keep only well-formed entries', () => {
  const about = getAbout('fallback');
  assert.deepEqual(about.skills, [{ name: 'Ops', icon: 'ops', items: [] }]);
  assert.deepEqual(about.interests, [
    { name: 'Homelab', icon: 'server', blurb: '' },
  ]);
  assert.equal(about.interestsHeading, 'Outside work');
});

void test('a blog image that is not text is dropped', () => {
  const [post] = getAllPostMeta();
  assert.equal(post?.meta.image, undefined);
});

void test('check:content names each slip', () => {
  const run = spawnSync(
    process.execPath,
    [fileURLToPath(new URL('../scripts/check-content.ts', import.meta.url))],
    { env: { ...process.env, CONTENT_DIR: root }, encoding: 'utf8' },
  );
  assert.equal(run.status, 1);
  for (const message of [
    'tech must be a list of strings',
    'features must be a list of strings',
    'link must be text, not a number (quote it)',
    'challenges must be text, not a list',
    'image must be text, not nested keys',
    'unknown frontmatter key "skillHeading"',
    'skills entry 1: items must be a list of strings',
    'skills entry 2 has no name',
    'skills entry 3 has no name',
    'interests entry 1 has no name',
    'interests entry 2: blurb must be text, not a list',
  ]) {
    assert.ok(run.stderr.includes(message), message);
  }
  // And nothing else: the valid keys and entries raise no false positives.
  assert.match(run.stderr, /^11 error\(s\):$/m);
});
