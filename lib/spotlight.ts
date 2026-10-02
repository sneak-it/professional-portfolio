import type { PointerEvent } from 'react';

/** Points the `spotlight` utility's glow at the pointer. */
export function moveSpotlight(event: PointerEvent<HTMLElement>) {
  const card = event.currentTarget;
  const box = card.getBoundingClientRect();
  card.style.setProperty('--x', `${event.clientX - box.left}px`);
  card.style.setProperty('--y', `${event.clientY - box.top}px`);
}
