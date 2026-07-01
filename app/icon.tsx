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
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 22,
        fontWeight: 700,
        color: 'white',
        // keep in sync with --accent-* in app/globals.css
        background: 'linear-gradient(135deg, #ffb400 0%, #ff1e78 100%)',
        borderRadius: 7,
      }}
    >
      P
    </div>,
    size,
  );
}
