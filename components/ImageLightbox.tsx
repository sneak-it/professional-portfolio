'use client';

import Lightbox, { type SlideImage } from 'yet-another-react-lightbox';
import Download from 'yet-another-react-lightbox/plugins/download';
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';

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
  const multiple = slides.length > 1;
  const noButton = multiple ? undefined : () => null;

  return (
    <Lightbox
      open={index >= 0}
      index={index}
      close={close}
      slides={slides}
      plugins={
        multiple
          ? [Download, Fullscreen, Thumbnails, Zoom]
          : [Download, Fullscreen, Zoom]
      }
      controller={{ closeOnBackdropClick: true, closeOnPullDown: true }}
      carousel={{ imageProps: { referrerPolicy: 'no-referrer' } }}
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
