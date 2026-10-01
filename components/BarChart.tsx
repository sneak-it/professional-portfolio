import { Children, Fragment, isValidElement, type ReactNode } from 'react';
import {
  formatCompact,
  formatFull,
  formatLabel,
  parseChart,
  ticks,
  type BarProps,
  type ChartBar,
  type MarkerProps,
} from '@/lib/chart';

/** One bar of a `BarChart`: `<Bar label value show />`. Renders nothing itself. */
export const Bar: (props: BarProps) => null = () => null;

/** A labelled rule after the bar named by `after`. Renders nothing itself. */
export const Marker: (props: MarkerProps) => null = () => null;

// Slot 1 of the validated dataviz palette, stepped per theme.
const FILL = 'bg-[#2a78d6] dark:bg-[#3987e5]';

/**
 * Bar chart for MDX bodies; `blockJS` strips array props, so data arrives as
 * `<Bar>` and `<Marker>` children. The table is the drawing's accessible twin.
 */
export default function BarChart({
  title,
  note,
  orientation,
  children,
}: {
  title?: string;
  note?: string;
  orientation?: string;
  children?: ReactNode;
}) {
  const elements = Children.toArray(children).filter(isValidElement);
  const propsOf = (type: unknown) =>
    elements.filter((e) => e.type === type).map((e) => e.props);

  let bars: ChartBar[];
  try {
    bars = parseChart(
      propsOf(Bar) as BarProps[],
      propsOf(Marker) as MarkerProps[],
    );
  } catch (error) {
    // Content is edited live in production, where a thrown error would hide
    // the message behind the generic error page.
    return (
      <p className="not-prose my-8 rounded-r-2xl border-l-4 border-amber-500 bg-amber-500/10 px-5 py-4 text-sm text-amber-800 dark:text-amber-200">
        <strong>Chart not drawn.</strong> {(error as Error).message}
      </p>
    );
  }
  const max = Math.max(0, ...bars.map((b) => b.value));

  return (
    <figure className="not-prose my-10">
      {title && (
        <figcaption className="mb-5 font-semibold text-gray-900 dark:text-white">
          {title}
        </figcaption>
      )}
      {orientation === 'horizontal' ? (
        <Rows bars={bars} max={max} />
      ) : (
        <Columns bars={bars} max={max} />
      )}
      {note && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{note}</p>
      )}
      <details className="mt-4">
        <summary className="cursor-pointer font-mono text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400">
          Data table
        </summary>
        <table className="mt-3 w-full text-sm">
          {title && <caption className="sr-only">{title}</caption>}
          <tbody>
            {bars.map((bar, i) => (
              <Fragment key={i}>
                <tr className="border-b border-gray-100 dark:border-white/10">
                  <th
                    scope="row"
                    className="py-1.5 pe-4 text-start font-normal text-gray-600 dark:text-gray-300"
                  >
                    {bar.label}
                  </th>
                  <td className="py-1.5 text-end tabular-nums text-gray-900 dark:text-white">
                    {formatFull(bar.value)}
                  </td>
                </tr>
                {bar.markers.map((marker, j) => (
                  <tr
                    key={j}
                    className="border-b border-gray-100 dark:border-white/10"
                  >
                    <td
                      colSpan={2}
                      className="py-1.5 text-gray-500 dark:text-gray-400"
                    >
                      {marker.note
                        ? `${marker.label}, ${marker.note}`
                        : marker.label}
                    </td>
                  </tr>
                ))}
              </Fragment>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

/** Vertical: gridlines on a rounded maximum, values only on `show` bars. */
function Columns({ bars, max }: { bars: ChartBar[]; max: number }) {
  const axis = ticks(max);
  const top = axis[axis.length - 1] ?? 1;
  const percent = (value: number) => `${(value / top) * 100}%`;
  // A phone fits about six axis labels; the table keeps every one.
  const labelStep = Math.ceil(bars.length / 6);
  return (
    <div aria-hidden className="pt-6">
      <div className="relative ms-10 h-56">
        {axis.map((tick) => (
          <div
            key={tick}
            className={`absolute inset-x-0 border-t ${
              tick === 0
                ? 'border-gray-300 dark:border-white/25'
                : 'border-gray-200 dark:border-white/10'
            }`}
            style={{ bottom: percent(tick) }}
          >
            <span className="absolute end-full me-2 -translate-y-1/2 text-xs tabular-nums text-gray-500 dark:text-gray-400">
              {formatCompact(tick)}
            </span>
          </div>
        ))}
        <div className="absolute inset-0 flex">
          {bars.map((bar, i) => (
            <Fragment key={i}>
              <div className="flex flex-1 items-end justify-center px-px">
                <div
                  className={`relative w-full max-w-6 rounded-t ${FILL}`}
                  style={{ height: percent(bar.value) }}
                >
                  {bar.show && (
                    <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 whitespace-nowrap text-xs font-medium tabular-nums text-gray-700 dark:text-gray-200">
                      {formatLabel(bar.value, max)}
                    </span>
                  )}
                </div>
              </div>
              {bar.markers.map((marker, j) => (
                <div
                  key={j}
                  className="relative w-px flex-none bg-gray-400 dark:bg-gray-500"
                >
                  {/* Over whichever neighbour is shorter, where there is room. */}
                  <span
                    className={`absolute top-0 w-max max-w-16 text-xs leading-snug sm:max-w-32 ${
                      (bars[i + 1]?.value ?? Infinity) <= bar.value
                        ? 'start-full ps-1.5'
                        : 'end-full pe-1.5 text-end'
                    }`}
                  >
                    <span className="block font-medium text-gray-700 dark:text-gray-200">
                      {marker.label}
                    </span>
                    {marker.note && (
                      <span className="block text-gray-500 dark:text-gray-400">
                        {marker.note}
                      </span>
                    )}
                  </span>
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
      <div className="ms-10 mt-2 flex">
        {bars.map((bar, i) => (
          <span
            key={i}
            className={`flex min-w-0 flex-1 justify-center whitespace-nowrap text-xs text-gray-500 dark:text-gray-400 ${
              i % labelStep ? 'max-sm:invisible' : ''
            }`}
          >
            {bar.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Horizontal: one row per bar, every value at its tip. */
function Rows({ bars, max }: { bars: ChartBar[]; max: number }) {
  return (
    <div
      aria-hidden
      className="grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-2"
    >
      {bars.map((bar, i) => (
        <Fragment key={i}>
          <span className="text-end text-sm text-gray-600 dark:text-gray-300">
            {bar.label}
          </span>
          <div className="flex items-center gap-2">
            {/* 4.5rem stays free for the value beside the longest bar. */}
            <div
              className={`h-5 shrink-0 rounded-e ${FILL}`}
              style={{
                width: `calc((100% - 4.5rem) * ${max > 0 ? bar.value / max : 0})`,
              }}
            />
            <span className="whitespace-nowrap text-sm tabular-nums text-gray-700 dark:text-gray-200">
              {formatLabel(bar.value, max)}
            </span>
          </div>
          {bar.markers.map((marker, j) => (
            <div key={j} className="col-span-2 flex items-center gap-2 text-xs">
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {marker.label}
              </span>
              {marker.note && (
                <span className="text-gray-500 dark:text-gray-400">
                  {marker.note}
                </span>
              )}
              <span className="h-px flex-1 bg-gray-400 dark:bg-gray-500" />
            </div>
          ))}
        </Fragment>
      ))}
    </div>
  );
}
