import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 120,
        fontWeight: 700,
        color: 'white',
        // keep in sync with --accent-* in app/globals.css
        background: 'linear-gradient(135deg, #14b87a 0%, #4f7cff 100%)',
      }}
    >
      P
    </div>,
    size,
  );
}
