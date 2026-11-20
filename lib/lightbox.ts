import { getImageProps } from 'next/image';
import type { SlideImage } from 'yet-another-react-lightbox';

/** An image as the lightbox needs it: its `/media` src and served size. */
export interface LightboxImage {
  src: string;
  alt: string;
  width: number;
  height: number;
}

// A sizes without vw lists every configured width; the lightbox picks per
// drawn size and zoom. Widths past the served copy are dropped.
export function toSlide({
  src,
  alt,
  width,
  height,
}: LightboxImage): SlideImage {
  const { props } = getImageProps({ src, alt, width, height, sizes: '1px' });
  return {
    src: props.src,
    alt,
    width,
    height,
    download: { url: src, filename: src.slice(src.lastIndexOf('/') + 1) },
    srcSet: props.srcSet
      ?.split(', ')
      .map((entry) => {
        const space = entry.lastIndexOf(' ');
        const slideWidth = parseInt(entry.slice(space + 1), 10);
        return {
          src: entry.slice(0, space),
          width: slideWidth,
          height: Math.round((slideWidth * height) / width),
        };
      })
      .filter((s) => s.width <= width),
  };
}
