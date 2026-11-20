/**
 * Accent themes for SITE_THEME. Light mode draws text in the `-text` colors;
 * the `.dark` mapping in app/globals.css swaps in the vivid ones.
 */
export const THEME_NAMES = ['sunset', 'ocean', 'forest', 'violet'] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

export type Theme = Record<
  | '--accent'
  | '--accent-2'
  | '--accent-from'
  | '--accent-via'
  | '--accent-to'
  | '--accent-text'
  | '--accent-2-text'
  | '--accent-from-text'
  | '--accent-via-text'
  | '--accent-to-text',
  string
>;

export const THEMES: Record<ThemeName, Theme> = {
  sunset: {
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
  },
  ocean: {
    '--accent': '#38bdf8',
    '--accent-2': '#22d3ee',
    '--accent-from': '#22d3ee',
    '--accent-via': '#3b82f6',
    '--accent-to': '#818cf8',
    '--accent-text': '#0369a1',
    '--accent-2-text': '#0e7490',
    '--accent-from-text': '#0891b2',
    '--accent-via-text': '#2563eb',
    '--accent-to-text': '#4f46e5',
  },
  forest: {
    '--accent': '#34d399',
    '--accent-2': '#a3e635',
    '--accent-from': '#a3e635',
    '--accent-via': '#34d399',
    '--accent-to': '#2dd4bf',
    '--accent-text': '#047857',
    '--accent-2-text': '#4d7c0f',
    '--accent-from-text': '#4d7c0f',
    '--accent-via-text': '#059669',
    '--accent-to-text': '#0d9488',
  },
  violet: {
    '--accent': '#c084fc',
    '--accent-2': '#f472b6',
    '--accent-from': '#f472b6',
    '--accent-via': '#c084fc',
    '--accent-to': '#818cf8',
    '--accent-text': '#7e22ce',
    '--accent-2-text': '#db2777',
    '--accent-from-text': '#db2777',
    '--accent-via-text': '#9333ea',
    '--accent-to-text': '#4f46e5',
  },
};

/** Zero specificity, so the `.dark` mapping in app/globals.css always wins. */
export function themeCss(theme: Theme): string {
  const declarations = Object.entries(theme)
    .map(([name, value]) => `${name}:${value};`)
    .join('');
  return `:where(:root){${declarations}}`;
}
