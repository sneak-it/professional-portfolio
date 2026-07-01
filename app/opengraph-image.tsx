import { ImageResponse } from 'next/og';
import { siteConfig } from '@/lib/site';

// Default share card, inherited by every route that doesn't define its own.
// Next also wires this up as the twitter:image for the summary_large_image card.
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
            // keep in sync with --accent-* in app/globals.css
            background: 'linear-gradient(135deg, #ffb400 0%, #ff1e78 100%)',
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
          // keep in sync with --accent-* in app/globals.css
          background: 'linear-gradient(90deg, #ffb400, #ff6b3d, #ff1e78)',
          borderRadius: 999,
        }}
      />
    </div>,
    size,
  );
}
