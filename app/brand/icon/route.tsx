import { ImageResponse } from 'next/og';
import { cachedImage } from '../cached-image';
import { MonogramTile } from '@/components/icons/MonogramTile';
import { siteConfig } from '@/lib/site';

// The favicon. A route handler so the URL can carry a version token, which
// earns the long Cache-Control in next.config.ts. app/layout.tsx emits the href.
export const dynamic = 'force-dynamic';

const size = { width: 32, height: 32 };

export const GET = cachedImage(
  () =>
    new ImageResponse(
      // Flat black: at 32px the favicon needs contrast.
      <MonogramTile
        monogram={siteConfig.monogram}
        size={size.width}
        background="#000000"
        radius={7}
      />,
      size,
    ),
);
