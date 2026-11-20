import type { CSSProperties, ReactNode } from 'react';
import type { LightboxImage } from '@/lib/lightbox';

/**
 * A link to the image's `/media` copy that opens in the page's lightbox instead
 * (components/PostLightbox.tsx). A link, not a button, so prose margins collapse.
 */
export default function LightboxTrigger({
  src,
  alt,
  width,
  height,
  className = '',
  style,
  children,
}: LightboxImage & {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}) {
  return (
    <a
      href={src}
      data-lightbox=""
      data-src={src}
      data-alt={alt}
      data-width={width}
      data-height={height}
      aria-haspopup="dialog"
      aria-label={alt ? `View image: ${alt}` : 'View image'}
      className={`cursor-zoom-in ${className}`.trim()}
      style={style}
    >
      {children}
    </a>
  );
}
