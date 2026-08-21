import { ImageResponse } from 'next/og';
import { MonogramTile } from '@/components/icons/MonogramTile';
import { ACCENT_BAR, ACCENT_DIAGONAL } from '@/lib/brand';
import { siteConfig } from '@/lib/site';

// Default share card, inherited by routes without their own; also the
// twitter:image. Per request, since it draws the env-driven identity.
export const dynamic = 'force-dynamic';

export const alt = siteConfig.title;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '80px',
        background: '#0f1115',
        color: 'white',
        fontFamily: 'sans-serif',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          marginBottom: 40,
        }}
      >
        <MonogramTile
          monogram={siteConfig.monogram}
          size={88}
          background={ACCENT_DIAGONAL}
          radius={20}
        />
        <span style={{ fontSize: 30, color: '#a1a1aa' }}>
          {siteConfig.author}
        </span>
      </div>
      <div
        style={{
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: '-0.03em',
          maxWidth: 900,
        }}
      >
        {siteConfig.title}
      </div>
      <div
        style={{
          marginTop: 28,
          fontSize: 32,
          color: '#d4d4d8',
          maxWidth: 900,
        }}
      >
        {siteConfig.description}
      </div>
      <div
        style={{
          marginTop: 'auto',
          height: 12,
          width: '100%',
          background: ACCENT_BAR,
          borderRadius: 999,
        }}
      />
    </div>,
    size,
  );
}
