import Image from 'next/image';
import type { CoverFit } from '@/lib/image';

/**
 * Cover image, falling back to an accent-gradient block. Shared by the blog
 * pages, CoverCard, and the portfolio section list.
 */
export default function CoverImage({
  src,
  alt,
  sizes,
  priority = false,
  className = '',
  fit,
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
  fit?: CoverFit | null;
}) {
  if (!src) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-accent-2/30" />
    );
  }
  const loading = priority ? 'eager' : 'lazy';
  const image = (
    <Image
      src={src}
      alt={alt}
      fill
      loading={loading}
      fetchPriority={priority ? 'high' : 'auto'}
      sizes={sizes}
      className={`${fit ? 'object-contain m-auto' : 'object-cover'} ${className}`.trim()}
      style={
        fit
          ? {
              width: '84%',
              height: '84%',
              maxWidth: fit.maxWidth,
              maxHeight: fit.maxHeight,
            }
          : undefined
      }
      referrerPolicy="no-referrer"
    />
  );
  if (!fit) return image;
  return (
    <>
      {fit.backdrop === 'panel' ? (
        <div className="absolute inset-0 bg-gray-100" />
      ) : (
        // Same src and sizes as the cover, so the browser fetches it once.
        <Image
          src={src}
          alt=""
          fill
          loading={loading}
          sizes={sizes}
          className="object-cover blur-xl brightness-60 scale-120"
          referrerPolicy="no-referrer"
        />
      )}
      {image}
    </>
  );
}
