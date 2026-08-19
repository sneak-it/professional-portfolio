import { ImageResponse } from 'next/og';
import { ACCENT_BAR, ACCENT_DIAGONAL } from '@/lib/brand';
import { siteConfig } from '@/lib/site';

// Default share card, inherited by every route that doesn't define its own.
// Next also wires this up as the twitter:image for the summary_large_image card.
//
// Rendered per request: it draws the env-driven name, title, and description,
// and a statically generated card would bake the build-time values in with no
// revalidation to correct them. Same reasoning as the force-dynamic pages.
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
        <div
          style={{
            width: 88,
            height: 88,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 20,
            background: ACCENT_DIAGONAL,
          }}
        >
          {/* Serif capital "I" drawn as three bars so it reads as a letter, not
              a bare vertical line. Top and bottom serifs bracket a narrower stem. */}
          <div style={{ width: 39, height: 8, background: 'white' }} />
          <div style={{ width: 11, height: 27, background: 'white' }} />
          <div style={{ width: 39, height: 8, background: 'white' }} />
        </div>
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
