'use client';

import { useEffect, useEffectEvent } from 'react';
import Lightbox, { type SlideImage } from 'yet-another-react-lightbox';
import Download from 'yet-another-react-lightbox/plugins/download';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';

const onLightboxEntry = () =>
  (window.history.state as { lightbox?: boolean } | null)?.lightbox === true;

/** The site's lightbox, open while `index >= 0`. Build slides with `toSlide`. */
export default function ImageLightbox({
  slides,
  index,
  close,
}: {
  slides: SlideImage[];
  index: number;
  close: () => void;
}) {
  const open = index >= 0;
  const noButton = slides.length > 1 ? undefined : () => null;
  const onBack = useEffectEvent(close);

  // Opening adds a history entry, so back closes the lightbox, not the page.
  useEffect(() => {
    if (!open) return;
    // Reuses one already there: forward onto it, or Strict Mode's second run.
    if (!onLightboxEntry()) {
      window.history.pushState({ lightbox: true }, '');
    }
    const handle = () => {
      onBack();
    };
    window.addEventListener('popstate', handle);
    return () => {
      window.removeEventListener('popstate', handle);
    };
  }, [open]);

  return (
    <Lightbox
      open={open}
      index={index}
      // Leaves through the entry, whose pop then closes it.
      close={() => {
        if (onLightboxEntry()) window.history.back();
        else close();
      }}
      slides={slides}
      plugins={[Download, Fullscreen, Zoom]}
      controller={{ closeOnBackdropClick: true, closeOnPullDown: true }}
      carousel={{
        finite: true,
        imageProps: { referrerPolicy: 'no-referrer' },
      }}
      render={{ buttonPrev: noButton, buttonNext: noButton }}
      labels={{
        Lightbox: 'Image viewer',
        Close: 'Close image viewer',
        Previous: 'Previous image',
        Next: 'Next image',
      }}
      styles={{ root: { '--yarl__color_backdrop': 'rgb(0 0 0 / 0.9)' } }}
    />
  );
}
