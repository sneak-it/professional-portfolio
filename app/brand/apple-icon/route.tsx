import { ImageResponse } from 'next/og';
import { cachedImage } from '../cached-image';
import { MonogramTile } from '@/components/icons/MonogramTile';
import { ACCENT_DIAGONAL } from '@/lib/brand';
import { siteConfig } from '@/lib/site';

// See app/brand/icon/route.tsx.
export const dynamic = 'force-dynamic';

const size = { width: 180, height: 180 };

export const GET = cachedImage(
  () =>
    new ImageResponse(
      // Full-bleed: iOS applies its own mask.
      <MonogramTile
        monogram={siteConfig.monogram}
        size={size.width}
        background={ACCENT_DIAGONAL}
        radius={0}
      />,
      size,
    ),
);
