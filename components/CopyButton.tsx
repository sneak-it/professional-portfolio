'use client';

import { useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

/** Copies the code of the block it sits in; rendered by `pre` in MDXComponents. */
export default function CopyButton() {
  const ref = useRef<HTMLButtonElement>(null);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const code = ref.current?.parentElement?.querySelector('code');
    if (!code) return;
    // A diff's removed lines are the old version, not what the reader wants.
    const lines = [...code.querySelectorAll('.line:not(.remove)')];
    const text = lines.length
      ? lines.map((line) => line.textContent).join('\n')
      : (code.textContent ?? '');
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      // No clipboard outside a secure context, or permission denied.
    }
  };

  return (
    <>
      <span aria-live="polite" className="sr-only">
        {copied ? 'Code copied to clipboard' : ''}
      </span>
      <button
        ref={ref}
        type="button"
        onClick={copy}
        aria-label="Copy code"
        className={`absolute end-3 top-3 flex size-8 items-center justify-center rounded-lg border border-gray-200 bg-white/90 text-gray-500 backdrop-blur-sm transition-opacity hover:text-gray-900 focus-visible:opacity-100 group-hover/code:opacity-100 dark:border-white/10 dark:bg-white/5 dark:text-gray-400 dark:hover:text-white ${
          // Hidden until hover where there is hover; always shown on touch.
          copied ? '' : '[@media(hover:hover)]:opacity-0'
        }`}
      >
        {copied ? (
          <Check size={16} aria-hidden />
        ) : (
          <Copy size={16} aria-hidden />
        )}
      </button>
    </>
  );
}
