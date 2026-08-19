import { ImageResponse } from 'next/og';
import { ACCENT_DIAGONAL } from '@/lib/brand';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: ACCENT_DIAGONAL,
      }}
    >
      {/* Serif capital "I" drawn as three bars so it reads as a letter, not a
          bare vertical line. Top and bottom serifs bracket a narrower stem. */}
      <div style={{ width: 79, height: 17, background: 'white' }} />
      <div style={{ width: 22, height: 56, background: 'white' }} />
      <div style={{ width: 79, height: 17, background: 'white' }} />
    </div>,
    size,
  );
}
