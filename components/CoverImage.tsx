import Image from 'next/image';

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
}: {
  src: string | null | undefined;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  if (!src) {
    return (
      <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-accent-2/30" />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      priority={priority}
      sizes={sizes}
      className={`object-cover ${className}`.trim()}
      referrerPolicy="no-referrer"
    />
  );
}
