import assert from 'node:assert/strict';
import { globSync, readFileSync } from 'node:fs';
import test from 'node:test';

const root = new URL('..', import.meta.url);

// lightningcss adds prefixes itself. Given a hand-written one after the standard
// line, it keeps only the prefixed copy, which only Safari reads.
void test('hand-written CSS has no -webkit- or -moz- prefixes', () => {
  const hits = globSync('app/**/*.css', { cwd: root }).flatMap((file) =>
    readFileSync(new URL(file, root), 'utf8')
      .split('\n')
      .flatMap((line, i) =>
        /-(webkit|moz)-/.test(line) ? [`${file}:${i + 1}: ${line.trim()}`] : [],
      ),
  );
  assert.deepEqual(hits, []);
});
