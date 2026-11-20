import assert from 'node:assert/strict';
import test from 'node:test';
import { THEMES, THEME_NAMES, themeCss } from '../lib/themes.ts';

// WCAG 2 relative luminance and contrast ratio.
function luminance(hex: string): number {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}

function contrast(a: string, b: string): number {
  const [la, lb] = [luminance(a), luminance(b)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const LIGHT_PAGE = '#f5f5f5';
const WHITE = '#ffffff';
const DARK_PAGE = '#0f1115';
const DARK_SURFACE = '#16181d';
const GRAY_950 = '#030712';

void test("sunset keeps today's colors", () => {
  assert.deepEqual(THEMES.sunset, {
    '--accent': '#ff4d6d',
    '--accent-2': '#ffb400',
    '--accent-from': '#ffb400',
    '--accent-via': '#ff6b3d',
    '--accent-to': '#ff1e78',
    '--accent-text': '#be123c',
    '--accent-2-text': '#ea580c',
    '--accent-from-text': '#ea580c',
    '--accent-via-text': '#f0443a',
    '--accent-to-text': '#e11d48',
  });
});

for (const name of THEME_NAMES) {
  const t = THEMES[name];

  void test(`${name} uses six-digit hex colors`, () => {
    for (const value of Object.values(t)) {
      assert.match(value, /^#[0-9a-f]{6}$/);
    }
  });

  void test(`${name} text is readable in light mode`, () => {
    assert.ok(contrast(t['--accent-text'], LIGHT_PAGE) >= 4.5);
    assert.ok(contrast(t['--accent-text'], WHITE) >= 4.5);
    for (const k of [
      '--accent-2-text',
      '--accent-from-text',
      '--accent-via-text',
      '--accent-to-text',
    ] as const) {
      assert.ok(contrast(t[k], LIGHT_PAGE) >= 3, `${name} ${k}`);
    }
  });

  void test(`${name} text is readable in dark mode`, () => {
    assert.ok(contrast(t['--accent'], DARK_PAGE) >= 4.5);
    assert.ok(contrast(t['--accent'], DARK_SURFACE) >= 4.5);
    assert.ok(contrast(t['--accent'], GRAY_950) >= 4.5);
    for (const k of [
      '--accent-2',
      '--accent-from',
      '--accent-via',
      '--accent-to',
    ] as const) {
      assert.ok(contrast(t[k], DARK_PAGE) >= 3, `${name} ${k}`);
    }
  });
}

void test('themeCss sets every token at zero specificity', () => {
  const css = themeCss(THEMES.ocean);
  assert.match(css, /^:where\(:root\)\{.*\}$/);
  for (const [k, v] of Object.entries(THEMES.ocean)) {
    assert.ok(css.includes(`${k}:${v};`), k);
  }
});
