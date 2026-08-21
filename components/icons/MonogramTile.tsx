/**
 * The monogram tile shared by app/icon.tsx, app/apple-icon.tsx, and
 * app/opengraph-image.tsx. Satori needs explicit `display: flex` and no CSS
 * shorthands; `next/og` bundles Geist, so the text costs no font fetch.
 */
export function MonogramTile({
  monogram,
  size,
  background,
  radius,
}: {
  monogram: string;
  size: number;
  background: string;
  radius: number;
}) {
  // Bound an over-long SITE_MONOGRAM; three characters shrink to fit.
  const text = monogram.slice(0, 3);

  return (
    <div
      style={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background,
        borderRadius: radius,
        fontFamily: 'sans-serif',
        fontWeight: 700,
        color: 'white',
        fontSize: size * (text.length > 2 ? 0.36 : 0.5),
        lineHeight: 1,
        letterSpacing: '-0.04em',
      }}
    >
      {text}
    </div>
  );
}
