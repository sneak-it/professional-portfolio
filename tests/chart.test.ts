import assert from 'node:assert/strict';
import test from 'node:test';
import {
  formatCompact,
  formatFull,
  formatLabel,
  parseChart,
  ticks,
} from '../lib/chart.ts';

const values = (bars: Array<{ value: string }>) =>
  parseChart(
    bars.map((b, i) => ({ label: `b${i}`, ...b })),
    [],
  ).map((b) => b.value);

void test('parseChart reads values with or without thousands commas', () => {
  assert.deepEqual(
    values([{ value: '380,875' }, { value: '2380786' }]),
    [380875, 2380786],
  );
  assert.deepEqual(
    values([{ value: '12.5' }, { value: ' 1,000 ' }]),
    [12.5, 1000],
  );
});

void test('parseChart names the bar and the value it cannot read', () => {
  assert.throws(
    () => parseChart([{ label: '2019', value: '38O,875' }], []),
    /Bar "2019".*"38O,875"/,
  );
});

// A dropped or doubled digit is exactly the typo commas would otherwise hide.
void test('parseChart rejects misplaced commas instead of stripping them', () => {
  assert.throws(() => values([{ value: '38,0875' }]), /"38,0875"/);
  assert.throws(() => values([{ value: '3,80,875' }]), /"3,80,875"/);
});

// Bars grow from a zero baseline, so a negative one has nowhere to go.
void test('parseChart rejects negative, empty, exponent, and missing values', () => {
  for (const value of ['-5', '', '1e3', 'Infinity', undefined]) {
    assert.throws(
      () => parseChart([{ label: 'x', value } as never], []),
      /Bar "x"/,
      `accepted ${String(value)}`,
    );
  }
});

void test('parseChart only treats the bare `show` attribute as on', () => {
  const bars = parseChart(
    [
      { label: 'a', value: '1', show: true },
      { label: 'b', value: '1' },
    ],
    [],
  );
  assert.deepEqual(
    bars.map((b) => b.show),
    [true, false],
  );
});

void test('parseChart attaches each marker to the bar it follows', () => {
  const bars = parseChart(
    [
      { label: '2019', value: '380,875' },
      { label: '2023', value: '185,566' },
      { label: '2024', value: '6,137' },
    ],
    [{ after: '2023', label: 'CS2 released', note: 'September 2023' }],
  );
  assert.deepEqual(
    bars.map((b) => b.markers),
    [[], [{ label: 'CS2 released', note: 'September 2023' }], []],
  );
});

void test('parseChart names a marker whose bar does not exist', () => {
  assert.throws(
    () =>
      parseChart(
        [{ label: '2023', value: '1' }],
        [{ after: '2022', label: 'CS2 released' }],
      ),
    /Marker "CS2 released".*"2022"/,
  );
});

void test('ticks rounds the maximum up to a clean step', () => {
  assert.deepEqual(ticks(380875), [0, 100000, 200000, 300000, 400000]);
  assert.deepEqual(ticks(185566), [0, 50000, 100000, 150000, 200000]);
  assert.deepEqual(ticks(6137), [0, 2000, 4000, 6000, 8000]);
  assert.deepEqual(ticks(400000), [0, 100000, 200000, 300000, 400000]);
});

void test('ticks has a non-zero top when every bar is zero', () => {
  assert.deepEqual(ticks(0), [0, 1]);
});

// 0.8 / 0.2 is 4.000000000000001 in floating point; a bare ceil adds a tick.
void test('ticks stays exact for fractional maxima', () => {
  assert.deepEqual(ticks(0.8), [0, 0.2, 0.4, 0.6, 0.8]);
  assert.deepEqual(ticks(1), [0, 0.5, 1]);
});

void test('ticks always spans the data in two to five even steps', () => {
  for (let max = 0.37; max < 5e7; max *= 1.37) {
    const t = ticks(max);
    const top = t[t.length - 1] ?? 0;
    const step = t[1] ?? 0;
    assert.equal(t[0], 0);
    assert.ok(t.length >= 2 && t.length <= 5, `${t.length} ticks for ${max}`);
    assert.ok(top >= max && top < 2 * max, `top ${top} for ${max}`);
    for (const [i, v] of t.entries()) {
      assert.ok(Math.abs(v - i * step) < step * 1e-9, `uneven at ${max}`);
    }
  }
});

void test('formatCompact abbreviates to three significant digits', () => {
  assert.equal(formatCompact(0), '0');
  assert.equal(formatCompact(1000), '1K');
  assert.equal(formatCompact(2500), '2.5K');
  assert.equal(formatCompact(100000), '100K');
  assert.equal(formatCompact(581741), '582K');
  assert.equal(formatCompact(2380786), '2.38M');
});

void test('formatFull groups thousands and keeps decimals', () => {
  assert.equal(formatFull(380875), '380,875');
  assert.equal(formatFull(2380786), '2,380,786');
  assert.equal(formatFull(12.5), '12.5');
});

// One format per chart: a 2.38M bar beside a 581,741 one reads as two scales.
void test('formatLabel goes compact for the whole chart once it reaches a million', () => {
  assert.equal(formatLabel(6137, 380875), '6,137');
  assert.equal(formatLabel(999999, 999999), '999,999');
  assert.equal(formatLabel(581741, 2380786), '582K');
  assert.equal(formatLabel(2380786, 2380786), '2.38M');
});
