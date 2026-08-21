import { ImageResponse } from 'next/og';
import { MonogramTile } from '@/components/icons/MonogramTile';
import { siteConfig } from '@/lib/site';

// Also the favicon: Next emits the <link rel="icon"> tags from this convention.
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

// Per request so a runtime SITE_MONOGRAM applies; Next caches these by default.
export const dynamic = 'force-dynamic';

export default function Icon() {
  return new ImageResponse(
    // Flat black: at 32px the favicon needs contrast, not a gradient.
    <MonogramTile
      monogram={siteConfig.monogram}
      size={size.width}
      background="#000000"
      radius={7}
    />,
    size,
  );
}
