'use client';

import { useEffect, useState } from 'react';
import { useMotionEnabled } from '@/hooks/use-motion-enabled';

const WORDS = ['Experiences', 'Opportunities', 'Connections', 'Solutions'];
const TYPE_MS = 1000; // time to type a full word
const DELETE_MS = 500; // time to delete a full word
const HOLD_MS = 2000; // pause on a completed word before deleting

export default function Typewriter() {
  const { tier } = useMotionEnabled();
  const [wordIndex, setWordIndex] = useState(0);
  // Start with the first word already typed
  const [text, setText] = useState(WORDS[0]);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    // Reduced motion: schedule nothing, so `text` stays on its initial full
    // word. The CSS entrances and the cursor blink are already gated in
    // page.module.css; this is the JS half of the same preference.
    if (tier === 'none') return;

    const word = WORDS[wordIndex];
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
        // Advance to the next word from a timer (not synchronously in the
        // effect body) — gives a brief beat between words and keeps the state
        // updates inside a callback.
        timer = setTimeout(() => {
          setDeleting(false);
          setWordIndex((i) => (i + 1) % WORDS.length);
        }, 400);
      }
    }

    return () => {
      clearTimeout(timer);
    };
  }, [text, deleting, wordIndex, tier]);

  return <span>{text}</span>;
}
