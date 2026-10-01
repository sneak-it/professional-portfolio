import rehypeShiki, { type RehypeShikiOptions } from '@shikijs/rehype';
import githubLight from '@shikijs/themes/github-light-default';
import {
  transformerMetaHighlight,
  transformerNotationDiff,
} from '@shikijs/transformers';

// Comments at 6.1:1 on white instead of 4.55:1, so tinted lines still pass AA.
const light = {
  ...githubLight,
  tokenColors: [
    ...(githubLight.tokenColors ?? []),
    {
      scope: ['comment', 'punctuation.definition.comment', 'string.comment'],
      settings: { foreground: '#59636e' },
    },
  ],
};

/**
 * Code fences highlighted on the server in both themes; app/globals.css shows
 * the one the theme toggle picks.
 */
export const rehypeHighlight: [typeof rehypeShiki, RehypeShikiOptions] = [
  rehypeShiki,
  {
    themes: { light, dark: 'github-dark-default' },
    defaultColor: false,
    // Grammars load on first use; an unknown language renders as plain text.
    langs: [],
    lazy: true,
    defaultLanguage: 'text',
    fallbackLanguage: 'text',
    transformers: [transformerMetaHighlight(), transformerNotationDiff()],
  },
];
