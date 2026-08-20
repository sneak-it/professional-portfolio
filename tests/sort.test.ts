import assert from 'node:assert/strict';
import test from 'node:test';
import { byDateDesc } from '../lib/sort.ts';

const d = (date?: string) => ({ date });

void test('byDateDesc orders newest first', () => {
  assert.equal(byDateDesc(d('2026-01-02'), d('2026-01-01')), -1);
  assert.equal(byDateDesc(d('2026-01-01'), d('2026-01-02')), 1);
  assert.equal(byDateDesc(d('2026-01-01'), d('2026-01-01')), 0);
});

// The reason the comparator parses instead of comparing strings: '2026-4-26'
// sorts after '2026-12-01' lexically but before it chronologically.
//
// Only day-granularity claims are asserted here. Date.parse reads a padded ISO
// date as UTC midnight but a non-padded one as *local* midnight, so
// '2026-4-26' and '2026-04-26' are not the same instant and their relative
// order depends on the machine's timezone.
void test('byDateDesc handles non-zero-padded dates', () => {
  assert.equal(byDateDesc(d('2026-4-26'), d('2026-12-01')), 1);
  assert.equal(byDateDesc(d('2026-4-26'), d('2026-04-25')), -1);
});

void test('byDateDesc sorts missing and unparseable dates last', () => {
  for (const bad of [undefined, '', 'not a date', 'yesterday', '2026-13-99']) {
    assert.equal(byDateDesc(d('2026-01-01'), d(bad)), -1, String(bad));
    assert.equal(byDateDesc(d(bad), d('2026-01-01')), 1, String(bad));
  }
  assert.equal(byDateDesc(d(undefined), d(undefined)), 0);
  assert.equal(byDateDesc(d('nope'), d(undefined)), 0);
});

void test('byDateDesc is antisymmetric', () => {
  const values = ['2026-01-01', '2025-06-15', '2026-4-26', undefined, 'nope'];
  for (const a of values) {
    for (const b of values) {
      // Summing avoids asserting against -0, which strict equal rejects.
      assert.equal(
        byDateDesc(d(a), d(b)) + byDateDesc(d(b), d(a)),
        0,
        `${a} vs ${b}`,
      );
    }
  }
});

void test('byDateDesc sorts a mixed list', () => {
  const items = [
    d('2025-06-15'),
    d(undefined),
    d('2026-4-26'),
    d('2026-12-01'),
    d('nope'),
  ];
  assert.deepEqual(
    [...items].sort(byDateDesc).map((i) => i.date),
    ['2026-12-01', '2026-4-26', '2025-06-15', undefined, 'nope'],
  );
});
