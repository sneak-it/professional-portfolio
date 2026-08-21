import { ImageResponse } from 'next/og';
import { MonogramTile } from '@/components/icons/MonogramTile';
import { ACCENT_DIAGONAL } from '@/lib/brand';
import { siteConfig } from '@/lib/site';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

// Per request so a runtime SITE_MONOGRAM applies. See app/icon.tsx.
export const dynamic = 'force-dynamic';

export default function AppleIcon() {
  return new ImageResponse(
    // Full-bleed: iOS applies its own mask.
    <MonogramTile
      monogram={siteConfig.monogram}
      size={size.width}
      background={ACCENT_DIAGONAL}
      radius={0}
    />,
    size,
  );
}
