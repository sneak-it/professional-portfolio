import { ImageResponse } from 'next/og';

// Route segment config — also serves as the favicon (Next emits the
// <link rel="icon"> tags from this file convention).
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // Flat black, not an accent: the 32px favicon needs contrast, not a gradient.
        background: '#000000',
        borderRadius: 7,
      }}
    >
      {/* Serif capital "I" drawn as three bars so it reads as a letter, not a
          bare vertical line. Top and bottom serifs bracket a narrower stem. */}
      <div style={{ width: 14, height: 3, background: 'white' }} />
      <div style={{ width: 4, height: 10, background: 'white' }} />
      <div style={{ width: 14, height: 3, background: 'white' }} />
    </div>,
    size,
  );
}
