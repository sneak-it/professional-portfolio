/**
 * Pure logic for components/BarChart.tsx. MDX hands every prop over as a
 * string, so values are parsed here, with errors that name the bar.
 */

export interface BarProps {
  label: string;
  value: string;
  show?: boolean;
}

export interface MarkerProps {
  after: string;
  label: string;
  note?: string;
}

export interface ChartBar {
  label: string;
  value: number;
  show: boolean;
  /** Markers drawn after this bar. */
  markers: Array<Omit<MarkerProps, 'after'>>;
}

// Non-negative; thousands commas either correctly placed or absent.
const VALUE = /^(\d{1,3}(,\d{3})+|\d+)(\.\d+)?$/;

/** Parsed bars with their markers attached. Throws naming the bad bar or marker. */
export function parseChart(
  bars: BarProps[],
  markers: MarkerProps[],
): ChartBar[] {
  const parsed = bars.map(({ label, value, show }): ChartBar => {
    const raw = typeof value === 'string' ? value.trim() : '';
    if (!VALUE.test(raw)) {
      throw new Error(
        `Bar "${label}": value "${value}" is not a number like 380,875 or 12.5`,
      );
    }
    return {
      label,
      value: Number(raw.replaceAll(',', '')),
      show: show === true,
      markers: [],
    };
  });
  for (const { after, ...marker } of markers) {
    const bar = parsed.find((b) => b.label === after);
    if (!bar) {
      throw new Error(`Marker "${marker.label}": no bar labelled "${after}"`);
    }
    bar.markers.push(marker);
  }
  return parsed;
}

// Rounds off float noise (0.8 / 0.2 is 4.000000000000001) and nothing else.
const exact = (n: number) => Number(n.toPrecision(12));

/** Gridline values from 0 up to the rounded maximum: two to five, evenly stepped. */
export function ticks(max: number): number[] {
  if (!(max > 0)) return [0, 1];
  const magnitude = 10 ** Math.floor(Math.log10(max / 4));
  const step =
    [1, 2, 5, 10].map((m) => m * magnitude).find((s) => s * 4 >= max) ?? max;
  const count = Math.ceil(exact(max / step));
  return Array.from({ length: count + 1 }, (_, i) => exact(i * step));
}

// en-US, like lib/date.ts.
const FULL = new Intl.NumberFormat('en-US');
const COMPACT = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumSignificantDigits: 3,
});

export const formatFull = (n: number) => FULL.format(n);
export const formatCompact = (n: number) => COMPACT.format(n);

/** A bar's label. One format per chart, so it goes compact once any bar reaches a million. */
export const formatLabel = (value: number, max: number) =>
  max >= 1e6 ? formatCompact(value) : formatFull(value);
