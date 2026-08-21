'use client';

import { useEffect, useState } from 'react';
import { useMotionEnabled } from '@/hooks/use-motion-enabled';

const TYPE_MS = 1000; // time to type a full word
const DELETE_MS = 500; // time to delete a full word
const HOLD_MS = 2000; // pause on a completed word before deleting

// Non-empty tuple: the initial state and the wordIndex fallback both index [0].
export default function Typewriter({
  words,
}: {
  words: [string, ...string[]];
}) {
  const { tier } = useMotionEnabled();
  const [wordIndex, setWordIndex] = useState(0);
  // Start with the first word already typed
  const [text, setText] = useState(words[0]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Reduced motion: the JS half of the gating page.module.css already does.
    if (tier === 'none') return;

    // Always in range (% words.length); the fallback is for the compiler.
    const word = words[wordIndex] ?? words[0];
    let timer: ReturnType<typeof setTimeout>;

    if (!deleting) {
      if (text.length < word.length) {
        timer = setTimeout(() => {
          setText(word.slice(0, text.length + 1));
        }, TYPE_MS / word.length);
      } else {
        timer = setTimeout(() => {
          setDeleting(true);
        }, HOLD_MS);
      }
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => {
          setText(word.slice(0, text.length - 1));
        }, DELETE_MS / word.length);
      } else {
        // From a timer, not the effect body: gives a beat between words.
        timer = setTimeout(() => {
          setDeleting(false);
          setWordIndex((i) => (i + 1) % words.length);
        }, 400);
      }
    }

    return () => {
      clearTimeout(timer);
    };
  }, [text, deleting, wordIndex, tier, words]);

  return <span>{text}</span>;
}
