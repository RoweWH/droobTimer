import { useEffect, useMemo, useState } from 'react';

import { useTheme } from '../../../context/ThemeContext';
import type { ActiveSession, Solve } from '../../../features/droobTimer/types';
import { SketchColorPicker, SketchColorSwatch, type SketchColor } from '../SketchColorPicker';

import './SketchHistogram.css';

type SketchHistogramProps = {
  solves: Solve[];
  compact?: boolean;
  onExpand?: () => void;
  activeSession: ActiveSession;
};

type HistogramBin = {
  label: string;
  description: string;
  count: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type CountGridLine = {
  value: number;
  y: number;
};

type HistogramData = {
  bins: HistogramBin[];
  gridLines: CountGridLine[];
};

type BinSettings = {
  start: number;
  width: number;
  count: number;
};

type TimePrecision = 'tenth' | 'second';

const HISTOGRAM_COLOR_STORAGE_KEY = 'droobtimer-histogram-color';

const CHART_LEFT = 68;
const CHART_RIGHT = 770;
const CHART_TOP = 32;
const CHART_BOTTOM = 338;

const MAX_BIN_COUNT = 6;

/*
  The smallest supported interval is one tenth of a second.
  All histogram calculations remain in centiseconds.
*/
const MIN_BIN_WIDTH = 10;

const CENTISECONDS_PER_TENTH = 10;
const CENTISECONDS_PER_SECOND = 100;
const CENTISECONDS_PER_MINUTE = 6000;

const NICE_BIN_MULTIPLIERS = [1, 2, 3, 5, 10];

function isSketchColor(value: string | null): value is SketchColor {
  return ['blue', 'brown', 'gray', 'green', 'orange', 'pink', 'purple', 'red', 'teal', 'yellow'].includes(value ?? '');
}

function loadHistogramColor(): SketchColor {
  if (typeof window === 'undefined') {
    return 'blue';
  }

  const storedColor = localStorage.getItem(HISTOGRAM_COLOR_STORAGE_KEY);

  return isSketchColor(storedColor) ? storedColor : 'blue';
}

function getTimePrecision(binWidth: number): TimePrecision {
  return binWidth < CENTISECONDS_PER_SECOND ? 'tenth' : 'second';
}

function getDisplayUnit(precision: TimePrecision): number {
  return precision === 'tenth' ? CENTISECONDS_PER_TENTH : CENTISECONDS_PER_SECOND;
}

function formatHistogramTime(centiseconds: number, precision: TimePrecision): string {
  const safeCentiseconds = Math.max(0, Math.floor(centiseconds));

  if (precision === 'tenth') {
    const totalTenths = Math.floor(safeCentiseconds / CENTISECONDS_PER_TENTH);

    if (safeCentiseconds < CENTISECONDS_PER_MINUTE) {
      return (totalTenths / 10).toFixed(1);
    }

    const minutes = Math.floor(totalTenths / 600);

    const remainingTenths = totalTenths % 600;

    const seconds = remainingTenths / 10;

    return `${minutes}:${seconds.toFixed(1).padStart(4, '0')}`;
  }

  const totalSeconds = Math.floor(safeCentiseconds / CENTISECONDS_PER_SECOND);

  if (safeCentiseconds < CENTISECONDS_PER_MINUTE) {
    return String(totalSeconds);
  }

  const minutes = Math.floor(totalSeconds / 60);

  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

/*
  Plotly-inspired interval selection:

  1. Estimate a width from the complete recorded range.
  2. Round upward to a clean value.
  3. Align the starting boundary.
  4. Increase the interval if alignment creates more than
     six bins.
*/
function getNiceBinWidth(approximateWidth: number): number {
  const safeApproximateWidth = Math.max(MIN_BIN_WIDTH, approximateWidth);

  const magnitude = 10 ** Math.floor(Math.log10(safeApproximateWidth));

  const normalized = safeApproximateWidth / magnitude;

  const multiplier = NICE_BIN_MULTIPLIERS.find(candidate => candidate >= normalized) ?? 10;

  return Math.max(MIN_BIN_WIDTH, multiplier * magnitude);
}

function getBinSettings(minimum: number, maximum: number): BinSettings {
  const observedRange = maximum - minimum + 1;

  let width = getNiceBinWidth(observedRange / MAX_BIN_COUNT);

  let start = Math.floor(minimum / width) * width;

  let count = Math.floor((maximum - start) / width) + 1;

  while (count > MAX_BIN_COUNT) {
    width = getNiceBinWidth(width * 1.01);

    start = Math.floor(minimum / width) * width;

    count = Math.floor((maximum - start) / width) + 1;
  }

  return {
    start: Math.max(0, start),
    width,
    count: Math.max(1, count),
  };
}

function getCleanCountInterval(maximumCount: number): number {
  const approximateInterval = Math.max(1, maximumCount / 4);

  if (approximateInterval <= 1) {
    return 1;
  }

  if (approximateInterval <= 2) {
    return 2;
  }

  if (approximateInterval <= 5) {
    return 5;
  }

  const magnitude = 10 ** Math.floor(Math.log10(approximateInterval));

  const normalized = approximateInterval / magnitude;

  if (normalized <= 1) {
    return magnitude;
  }

  if (normalized <= 2) {
    return 2 * magnitude;
  }

  if (normalized <= 5) {
    return 5 * magnitude;
  }

  return 10 * magnitude;
}

function getNormalBinLabel(
  minimum: number,
  upperBoundary: number,
  precision: TimePrecision,
  isTimed: boolean
): string {
  const displayUnit = isTimed ? getDisplayUnit(precision) : 1;

  const maximum = upperBoundary - displayUnit;

  const minimumLabel = formatHistogramTime(minimum, precision);

  const maximumLabel = formatHistogramTime(maximum, precision);

  return minimumLabel === maximumLabel ? minimumLabel : `${minimumLabel}–${maximumLabel}`;
}

function createHistogram(completedTimes: number[], isTimed: boolean): HistogramData {
  if (completedTimes.length === 0) {
    return {
      bins: [],
      gridLines: [],
    };
  }

  const minimumTime = Math.min(...completedTimes);

  const maximumTime = Math.max(...completedTimes);

  const { start, width: binWidth, count: binCount } = getBinSettings(minimumTime, maximumTime);

  const precision = isTimed ? getTimePrecision(binWidth) : 'second';

  /*
    The first and last bins become overflow bins only when
    all six available columns have been established.
  */
  const usesOverflowBins = binCount === MAX_BIN_COUNT;

  const counts = Array.from({ length: binCount }, () => 0);

  const firstUpperBoundary = start + binWidth;

  const lastLowerBoundary = start + (binCount - 1) * binWidth;

  completedTimes.forEach(time => {
    if (usesOverflowBins && time < firstUpperBoundary) {
      counts[0] += 1;
      return;
    }

    if (usesOverflowBins && time >= lastLowerBoundary) {
      counts[binCount - 1] += 1;
      return;
    }

    const rawIndex = Math.floor((time - start) / binWidth);

    const index = Math.min(binCount - 1, Math.max(0, rawIndex));

    counts[index] += 1;
  });

  const displayUnit = getDisplayUnit(precision);

  const formatMetricValue = (value: number): string =>
    Number.isInteger(value / 100)
      ? String(value / 100)
      : (value / 100).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');

  const labels = Array.from({ length: binCount }, (_, index) => {
    const minimum = start + index * binWidth;

    const upperBoundary = minimum + binWidth;

    if (usesOverflowBins && index === 0) {
      const boundaryLabel = isTimed
        ? formatHistogramTime(firstUpperBoundary, precision)
        : formatMetricValue(firstUpperBoundary);

      return {
        label: `< ${boundaryLabel}`,
        description: `faster than ${boundaryLabel}`,
      };
    }

    if (usesOverflowBins && index === binCount - 1) {
      const lastDisplayedValue = lastLowerBoundary - displayUnit;

      const label = isTimed
        ? formatHistogramTime(lastDisplayedValue, precision)
        : formatMetricValue(lastDisplayedValue);

      const lowerBoundary = isTimed
        ? formatHistogramTime(lastLowerBoundary, precision)
        : formatMetricValue(lastLowerBoundary);

      return {
        label: `> ${label}`,
        description: `${lowerBoundary} or slower`,
      };
    }

    const rangeLabel = isTimed
      ? getNormalBinLabel(minimum, upperBoundary, precision, isTimed)
      : minimum === upperBoundary - displayUnit
        ? formatMetricValue(minimum)
        : `${formatMetricValue(minimum)}–${formatMetricValue(upperBoundary - displayUnit)}`;

    return {
      label: rangeLabel,
      description: rangeLabel,
    };
  });

  const largestCount = Math.max(...counts, 1);

  const countInterval = getCleanCountInterval(largestCount);

  const cleanMaximumCount = Math.ceil(largestCount / countInterval) * countInterval;

  const chartWidth = CHART_RIGHT - CHART_LEFT;

  const chartHeight = CHART_BOTTOM - CHART_TOP;

  const slotWidth = chartWidth / binCount;

  const barGap = Math.min(6, slotWidth * 0.12);

  const bins = counts.map((count, index) => {
    const label = labels[index];

    const height = (count / cleanMaximumCount) * chartHeight;

    return {
      label: label?.label ?? '',
      description: label?.description ?? '',

      count,

      x: CHART_LEFT + index * slotWidth + barGap / 2,

      y: CHART_BOTTOM - height,

      width: Math.max(1, slotWidth - barGap),

      height,
    };
  });

  const gridLines: CountGridLine[] = [];

  for (let value = 0; value <= cleanMaximumCount; value += countInterval) {
    gridLines.push({
      value,

      y: CHART_BOTTOM - (value / cleanMaximumCount) * chartHeight,
    });
  }

  return {
    bins,
    gridLines,
  };
}

function getGraphMetricValue(solve: Solve, activeSession: ActiveSession): number {
  if ('moves' in solve) {
    return solve.moves;
  }

  if ('solved' in solve) {
    const useSolvedAtHour = activeSession.mbldDisplayValue === 'wca' && solve.time >= 3_600_000;
    const solved = useSolvedAtHour ? solve.solvedAtHour : solve.solved;
    return solved - (solve.attempted - solved);
  }

  return (solve.time + solve.plusTwoCount * 2000) / 10;
}

export function SketchHistogram({
  solves,
  compact = false,
  onExpand,
  activeSession,
}: SketchHistogramProps) {
  const [selectedColor, setSelectedColor] = useState<SketchColor>(loadHistogramColor);

  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(HISTOGRAM_COLOR_STORAGE_KEY, selectedColor);
  }, [selectedColor]);

  /*
    Keep the original adjusted centisecond values. Precision
    is selected later from the automatically chosen bin width.
  */
  const isTimed = activeSession.eventId !== '333fm' && activeSession.eventId !== 'mbld';

  const completedTimes = useMemo(
    () =>
      solves
        .filter(solve => !solve.isDNF)
        .map(solve => {
          const value = getGraphMetricValue(solve, activeSession);
          return isTimed ? value : value * 100;
        }),
    [activeSession, solves, isTimed]
  );

  const dnfCount = useMemo(() => solves.filter(solve => solve.isDNF).length, [solves]);

  const histogram = useMemo(
    () => createHistogram(completedTimes, isTimed),
    [completedTimes, isTimed]
  );

  return (
    <div
      className={
        compact
          ? 'session-histogram session-histogram--compact'
          : 'session-histogram session-histogram--expanded'
      }
    >
      {!compact && (
        <div className="session-histogram-controls">
          <span>{solves.length} solves</span>

          <div className="session-chart-color-control">
            <div className="session-chart-color-picker-wrapper">
              <button
                type="button"
                className="session-chart-color-trigger"
                aria-label="Choose histogram color"
                aria-expanded={isColorPickerOpen}
                onClick={() => setIsColorPickerOpen(open => !open)}
              >
                <SketchColorSwatch color={selectedColor} />
              </button>

              {isColorPickerOpen && (
                <div className="session-chart-color-popover">
                  <SketchColorPicker
                    value={selectedColor}
                    onChange={color => {
                      setSelectedColor(color);
                      setIsColorPickerOpen(false);
                    }}
                  />
                </div>
              )}
            </div>

            <span>color</span>
          </div>

          {dnfCount > 0 && <span>DNF: {dnfCount}</span>}
        </div>
      )}

      <div
        className="session-histogram-canvas"
        role={compact ? 'button' : undefined}
        tabIndex={compact ? 0 : undefined}
        aria-label={compact ? 'Open session histogram' : 'Session solve-time histogram'}
        onClick={compact ? onExpand : undefined}
        onKeyDown={
          compact
            ? event => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onExpand?.();
                }
              }
            : undefined
        }
      >
        <HistogramSvg
          bins={histogram.bins}
          guides={histogram.gridLines}
          color={selectedColor}
          compact={compact}
          ariaLabel="Session solve-time histogram"
        />

        {completedTimes.length === 0 && (
          <div className="session-histogram-empty">
            {solves.length === 0 ? 'no solves yet' : 'no completed solves'}
          </div>
        )}

        {compact && <span className="session-histogram-preview-label">histogram</span>}
      </div>
    </div>
  );
}

type SketchHistogramBin = {
  label: string;
  description: string;
  count: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

type SketchHistogramGuide = { value: number; y: number };

type Props = {
  bins: SketchHistogramBin[];
  guides: SketchHistogramGuide[];
  color: SketchColor;
  compact?: boolean;
  ariaLabel: string;
};

const LEFT = 68;
const RIGHT = 770;
const TOP = 32;
const BOTTOM = 338;
const FULL_BUCKET_HEIGHT = BOTTOM - TOP;

function HistogramSvg({ bins, guides, color, compact = false, ariaLabel }: Props) {
  const { theme } = useTheme();
  const { buckets, grid } = theme.assets.histogram;

  return (
    <svg
      className="sketch-histogram"
      viewBox="0 0 800 400"
      preserveAspectRatio="none"
      role="img"
      aria-label={ariaLabel}
    >
      {guides.map(guide => (
        <image
          key={guide.value}
          href={grid.gridLine}
          x={LEFT}
          y={guide.y - 3}
          width={RIGHT - LEFT}
          height="6"
          preserveAspectRatio="none"
          aria-hidden="true"
        />
      ))}

      <image
        href={grid.vertical}
        x={LEFT - 4}
        y={TOP}
        width="8"
        height={BOTTOM - TOP}
        preserveAspectRatio="none"
        aria-hidden="true"
      />
      <image
        href={grid.horizontal}
        x={LEFT}
        y={BOTTOM - 4}
        width={RIGHT - LEFT}
        height="8"
        preserveAspectRatio="none"
        aria-hidden="true"
      />

      {bins.map((bin, index) => {
        if (bin.count === 0) return null;

        return (
          <g key={`${bin.label}-${index}`}>
            {/*
              The nested SVG is the variable-height window. The bucket artwork
              always stays at the chart's full height and is anchored to the
              bottom of that window, so shorter bars crop the artwork instead
              of vertically squashing it.
            */}
            <svg
              className="sketch-histogram__bucket-window"
              x={bin.x}
              y={bin.y}
              width={bin.width}
              height={bin.height}
              viewBox={`0 0 ${bin.width} ${bin.height}`}
              preserveAspectRatio="none"
              overflow="hidden"
              aria-hidden="true"
            >
              <image
                href={buckets[color]}
                x="0"
                y={bin.height - FULL_BUCKET_HEIGHT}
                width={bin.width}
                height={FULL_BUCKET_HEIGHT}
                preserveAspectRatio="none"
              />
            </svg>
          </g>
        );
      })}

      {!compact &&
        guides.map(guide => (
          <text
            className="sketch-histogram__label"
            key={`y-${guide.value}`}
            x={LEFT - 12}
            y={guide.y + 5}
            textAnchor="end"
          >
            {guide.value}
          </text>
        ))}

      {!compact &&
        bins.map((bin, index) => (
          <text
            className="sketch-histogram__label"
            key={`x-${bin.label}-${index}`}
            x={bin.x + bin.width / 2}
            y={BOTTOM + 29}
            textAnchor="middle"
          >
            {bin.label}
          </text>
        ))}

      {!compact &&
        bins.map((bin, index) => (
          <g className="sketch-histogram__hit" key={`hit-${bin.label}-${index}`}>
            <rect x={bin.x} y={TOP} width={bin.width} height={BOTTOM - TOP} />
            <title>{`${bin.description}: ${bin.count} ${bin.count === 1 ? 'solve' : 'solves'}`}</title>
            {bin.count > 0 && (
              <text x={bin.x + bin.width / 2} y={Math.max(12, bin.y - 7)} textAnchor="middle">
                {bin.count}
              </text>
            )}
          </g>
        ))}
    </svg>
  );
}
