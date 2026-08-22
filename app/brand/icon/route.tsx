import { ImageResponse } from 'next/og';
import { cachedImage } from '../cached-image';
import { MonogramTile } from '@/components/icons/MonogramTile';
import { siteConfig } from '@/lib/site';

// The favicon. A route handler so the URL can carry a version token, which
// earns the long Cache-Control in next.config.ts. app/layout.tsx emits the href.
export const dynamic = 'force-dynamic';

const size = { width: 64, height: 64 };

export const GET = cachedImage(
  () =>
    new ImageResponse(
      // Flat black: at favicon sizes the tile needs contrast.
      <MonogramTile
        monogram={siteConfig.monogram}
        size={size.width}
        background="#000000"
        radius={14}
      />,
      size,
    ),
);
