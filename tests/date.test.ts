import assert from 'node:assert/strict';
import test from 'node:test';
import { toFullDate } from '../lib/date.ts';

void test('toFullDate keeps full dates and drops partial ones', () => {
  assert.equal(
    toFullDate('2026-11-17')?.toISOString(),
    '2026-11-17T00:00:00.000Z',
  );
  assert.equal(
    toFullDate('2026-11-17T10:00:00Z')?.toISOString(),
    '2026-11-17T10:00:00.000Z',
  );
  assert.equal(toFullDate('2019'), undefined);
  assert.equal(toFullDate('2026-05'), undefined);
  assert.equal(toFullDate('2026-13-45'), undefined);
  assert.equal(toFullDate(undefined), undefined);
});
