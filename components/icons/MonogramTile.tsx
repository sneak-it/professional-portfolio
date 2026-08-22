/**
 * The monogram tile shared by the three app/brand/ image routes. Satori needs
 * explicit `display: flex` and no CSS shorthands.
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
  // Glyphs fill the tile: at favicon sizes anything smaller is unreadable.
  const chars = Math.min(monogram.length, 3);
  const fill = chars > 2 ? 0.42 : chars > 1 ? 0.58 : 0.95;
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
        fontSize: size * fill,
        lineHeight: 1,
        WebkitTextStrokeWidth: size * 0.035,
        WebkitTextStrokeColor: 'white',
      }}
    >
      {monogram}
    </div>
  );
}
