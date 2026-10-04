import { useEffect, useMemo, useState, type KeyboardEvent } from 'react';

import { useTheme } from '../../../context/ThemeContext';
import type { ActiveSession, Solve } from '../../../features/droobTimer/types';
import { formatTime } from '../../../features/droobTimer/utils/formatTime';
import { SketchColorPicker, SketchColorSwatch, type SketchColor } from '../SketchColorPicker';

import './SketchLineGraph.css';

type SketchLineGraphProps = {
  solves: Solve[];
  compact?: boolean;
  onSelectSolve?: (solve: Solve) => void;
  onExpand?: () => void;
  activeSession: ActiveSession;
};

type ChartPoint = {
  solve: Solve;
  solveNumber: number;
  x: number;
  y: number;
  isDNF: boolean;
};

type GridLine = {
  value: number;
  y: number;
};

type XAxisTick = {
  value: number;
  x: number;
};

const CHART_LEFT = 82;
const CHART_RIGHT = 770;
const CHART_TOP = 32;
const CHART_BOTTOM = 346;

const MAX_VISIBLE_SOLVES = 100;
const MAX_X_AXIS_TICK_COUNT = 5;

const X_AXIS_TICK_MULTIPLIERS = [1, 1.5, 2, 2.5, 3, 5, 10];

const LINE_CHART_COLOR_STORAGE_KEY = 'droobtimer-line-chart-color';

function clampSolveCount(value: number, maximum: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(maximum, Math.max(0, Math.floor(value)));
}

function getMaximumVisibleSolves(solveCount: number): number {
  return Math.min(solveCount, MAX_VISIBLE_SOLVES);
}

function isSketchColor(value: string | null): value is SketchColor {
  return ['blue', 'brown', 'gray', 'green', 'orange', 'pink', 'purple', 'red', 'teal', 'yellow'].includes(value ?? '');
}

function loadLineChartColor(): SketchColor {
  if (typeof window === 'undefined') {
    return 'blue';
  }

  const storedColor = localStorage.getItem(LINE_CHART_COLOR_STORAGE_KEY);

  return isSketchColor(storedColor) ? storedColor : 'blue';
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

function formatMetricNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

/* ---------------- Vertical Axis ---------------- */

function getCleanTickInterval(minimumTime: number, maximumTime: number): number {
  if (maximumTime <= 100) {
    return 5;
  }

  if (maximumTime <= 1000) {
    return 100;
  }

  const range = Math.max(1, maximumTime - minimumTime);

  const approximateInterval = range / 4;

  const magnitude = 10 ** Math.floor(Math.log10(approximateInterval));

  const normalizedInterval = approximateInterval / magnitude;

  let cleanMultiplier: number;

  if (normalizedInterval <= 1) {
    cleanMultiplier = 1;
  } else if (normalizedInterval <= 2) {
    cleanMultiplier = 2;
  } else if (normalizedInterval <= 5) {
    cleanMultiplier = 5;
  } else {
    cleanMultiplier = 10;
  }

  return Math.max(100, cleanMultiplier * magnitude);
}

function createCleanChartRange(completedTimes: number[]): {
  minimum: number;
  maximum: number;
  interval: number;
} {
  if (completedTimes.length === 0) {
    return {
      minimum: 0,
      maximum: 100,
      interval: 20,
    };
  }

  const smallestTime = Math.min(...completedTimes);

  const largestTime = Math.max(...completedTimes);

  let paddedMinimum: number;
  let paddedMaximum: number;

  if (smallestTime === largestTime) {
    const padding = Math.max(10, Math.round(smallestTime * 0.08));

    paddedMinimum = Math.max(0, smallestTime - padding);

    paddedMaximum = largestTime + padding;
  } else {
    const padding = Math.max(5, Math.round((largestTime - smallestTime) * 0.12));

    paddedMinimum = Math.max(0, smallestTime - padding);

    paddedMaximum = largestTime + padding;
  }

  const interval = getCleanTickInterval(paddedMinimum, paddedMaximum);

  let cleanMinimum = Math.floor(paddedMinimum / interval) * interval;

  let cleanMaximum = Math.ceil(paddedMaximum / interval) * interval;

  if (cleanMinimum === cleanMaximum) {
    cleanMinimum = Math.max(0, cleanMinimum - interval);

    cleanMaximum += interval;
  }

  return {
    minimum: cleanMinimum,
    maximum: cleanMaximum,
    interval,
  };
}

function createGridLines(minimum: number, maximum: number, interval: number): GridLine[] {
  const verticalRange = CHART_BOTTOM - CHART_TOP;

  const timeRange = maximum - minimum;

  const lines: GridLine[] = [];

  for (let value = maximum; value >= minimum; value -= interval) {
    const normalizedTime = (value - minimum) / timeRange;

    lines.push({
      value,

      y: CHART_BOTTOM - normalizedTime * verticalRange,
    });
  }

  return lines;
}

/* ---------------- Horizontal Axis ---------------- */

function getCleanXAxisStep(minimum: number, maximum: number): number {
  const range = Math.max(1, maximum - minimum);

  const approximateStep = range / (MAX_X_AXIS_TICK_COUNT - 1);

  const magnitude = 10 ** Math.floor(Math.log10(approximateStep));

  const normalizedStep = approximateStep / magnitude;

  const multiplier = X_AXIS_TICK_MULTIPLIERS.find(candidate => candidate >= normalizedStep) ?? 10;

  return Math.max(1, Math.ceil(multiplier * magnitude));
}

/*
  The first visible solve establishes tick0. Additional ticks
  use one consistent automatic interval.

  The final solve is labeled only if it naturally lands on
  that interval.
*/
function createXAxisTicks(points: ChartPoint[]): XAxisTick[] {
  if (points.length === 0) {
    return [];
  }

  if (points.length <= MAX_X_AXIS_TICK_COUNT) {
    return points.map(point => ({
      value: point.solveNumber,
      x: point.x,
    }));
  }

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];

  if (firstPoint === undefined || lastPoint === undefined) {
    return [];
  }

  if (firstPoint.solveNumber === lastPoint.solveNumber) {
    return [
      {
        value: firstPoint.solveNumber,
        x: firstPoint.x,
      },
    ];
  }

  const firstValue = firstPoint.solveNumber;

  const lastValue = lastPoint.solveNumber;

  const valueRange = lastValue - firstValue;

  const horizontalRange = CHART_RIGHT - CHART_LEFT;

  const step = getCleanXAxisStep(firstValue, lastValue);

  const ticks: XAxisTick[] = [];

  for (
    let value = firstValue;
    value <= lastValue && ticks.length < MAX_X_AXIS_TICK_COUNT;
    value += step
  ) {
    const normalizedPosition = (value - firstValue) / valueRange;

    ticks.push({
      value,

      x: CHART_LEFT + normalizedPosition * horizontalRange,
    });
  }

  return ticks;
}

export function SketchLineGraph({
  solves,
  compact = false,
  onSelectSolve,
  onExpand,
  activeSession,
}: SketchLineGraphProps) {
  const [selectedColor, setSelectedColor] = useState<SketchColor>(loadLineChartColor);

  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);

  const [visibleSolveCount, setVisibleSolveCount] = useState(MAX_VISIBLE_SOLVES);

  const maximumVisibleSolves = getMaximumVisibleSolves(solves.length);

  const effectiveVisibleSolveCount = clampSolveCount(visibleSolveCount, maximumVisibleSolves);

  const [inputValue, setInputValue] = useState(String(effectiveVisibleSolveCount));

  useEffect(() => {
    localStorage.setItem(LINE_CHART_COLOR_STORAGE_KEY, selectedColor);
  }, [selectedColor]);

  useEffect(() => {
    setInputValue(String(effectiveVisibleSolveCount));
  }, [effectiveVisibleSolveCount]);

  const chartData = useMemo(() => {
    return solves
      .slice(0, effectiveVisibleSolveCount)
      .map((solve, originalIndex) => ({
        solve,

        solveNumber: solves.length - originalIndex,
      }))
      .reverse();
  }, [effectiveVisibleSolveCount, solves]);

  const completedTimes = useMemo(
    () =>
      chartData
        .filter(({ solve }) => !solve.isDNF)
        .map(({ solve }) => getGraphMetricValue(solve, activeSession)),
    [activeSession, chartData]
  );

  const chartRange = useMemo(() => createCleanChartRange(completedTimes), [completedTimes]);

  const gridLines = useMemo(
    () => createGridLines(chartRange.minimum, chartRange.maximum, chartRange.interval),
    [chartRange]
  );

  const points = useMemo<ChartPoint[]>(() => {
    const horizontalRange = CHART_RIGHT - CHART_LEFT;

    const verticalRange = CHART_BOTTOM - CHART_TOP;

    const timeRange = chartRange.maximum - chartRange.minimum;

    return chartData.map(({ solve, solveNumber }, index) => {
      const x =
        chartData.length <= 1
          ? CHART_LEFT + horizontalRange / 2
          : CHART_LEFT + (index / (chartData.length - 1)) * horizontalRange;

      if (solve.isDNF) {
        return {
          solve,
          solveNumber,
          x,
          y: CHART_TOP + 10,
          isDNF: true,
        };
      }

      const adjustedTime = getGraphMetricValue(solve, activeSession);

      const normalizedTime = (adjustedTime - chartRange.minimum) / timeRange;

      return {
        solve,
        solveNumber,
        x,

        y: CHART_BOTTOM - normalizedTime * verticalRange,

        isDNF: false,
      };
    });
  }, [activeSession, chartData, chartRange]);

  const xAxisTicks = useMemo(() => createXAxisTicks(points), [points]);

  const commitInputValue = (): void => {
    if (inputValue.trim() === '') {
      setInputValue(String(effectiveVisibleSolveCount));

      return;
    }

    const nextCount = clampSolveCount(Number(inputValue), maximumVisibleSolves);

    setInputValue(String(nextCount));

    setVisibleSolveCount(nextCount);
  };

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter') {
      event.currentTarget.blur();
    }
  };

  return (
    <div
      className={
        compact
          ? 'session-line-chart session-line-chart--compact'
          : 'session-line-chart session-line-chart--expanded'
      }
    >
      {!compact && (
        <div className="session-line-chart-controls">
          <label>
            <span>show last</span>

            <input
              type="number"
              min="0"
              max={maximumVisibleSolves}
              step="1"
              inputMode="numeric"
              value={inputValue}
              onChange={event => {
                const value = event.target.value;

                if (value === '' || /^\d+$/.test(value)) {
                  setInputValue(value);
                }
              }}
              onBlur={commitInputValue}
              onKeyDown={handleInputKeyDown}
            />

            <span>solves</span>
          </label>

          <span aria-hidden="true" className="session-line-chart-controls-divider" />

          <div className="session-chart-color-control">
            <div className="session-chart-color-picker-wrapper">
              <button
                type="button"
                className="session-chart-color-trigger"
                aria-label="Choose line chart color"
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
        </div>
      )}

      <div
        className="session-line-chart-canvas"
        role={compact ? 'button' : undefined}
        tabIndex={compact ? 0 : undefined}
        aria-label={compact ? 'Open session line chart' : undefined}
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
        <LineGraphSvg
          points={points.map(point => ({
            id: point.solve.id,
            value: point.solve,
            label: `Solve ${point.solveNumber}`,
            x: point.x,
            y: point.y,
            isDNF: point.isDNF,
          }))}
          yGuides={gridLines.map(line => ({
            value: line.value,
            position: line.y,
            label:
              activeSession.eventId === '333fm' || activeSession.eventId === 'mbld'
                ? formatMetricNumber(line.value)
                : formatTime(line.value * 10),
          }))}
          xGuides={xAxisTicks.map(tick => ({
            value: tick.value,
            position: tick.x,
            label: String(tick.value),
          }))}
          color={selectedColor}
          compact={compact}
          ariaLabel={`Line chart showing ${points.length} solves`}
          onSelectPoint={onSelectSolve}
        />

        {points.length === 0 && (
          <div className="session-line-chart-empty">
            {solves.length === 0 ? 'no solves yet' : 'showing 0 solves'}
          </div>
        )}

        {compact && <span className="session-line-chart-preview-label">line chart</span>}
      </div>
    </div>
  );
}

type SketchLineGraphPoint<T> = {
  id: string | number;
  value: T;
  label: string;
  x: number;
  y: number;
  isDNF: boolean;
};
type SketchLineGraphGuide = { value: number; position: number; label: string };

type Props<T> = {
  points: SketchLineGraphPoint<T>[];
  yGuides: SketchLineGraphGuide[];
  xGuides: SketchLineGraphGuide[];
  color: SketchColor;
  compact?: boolean;
  ariaLabel: string;
  onSelectPoint?: (value: T) => void;
};

const LEFT = 82,
  RIGHT = 770,
  TOP = 32,
  BOTTOM = 346;
function LineGraphSvg<T>({
  points,
  yGuides,
  xGuides,
  color,
  compact = false,
  ariaLabel,
  onSelectPoint,
}: Props<T>) {
  const { theme } = useTheme();
  const { grid, lines, points: pointImages } = theme.assets.lineGraph;

  const handleKey = (event: KeyboardEvent<SVGGElement>, value: T) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelectPoint?.(value);
    }
  };

  return (
    <svg
      className="sketch-line-graph"
      viewBox="0 0 800 400"
      preserveAspectRatio="none"
      aria-label={ariaLabel}
    >
      {yGuides.map(guide => (
        <image
          key={guide.value}
          href={grid.gridLine}
          x={LEFT}
          y={guide.position - 3}
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
      {!compact &&
        xGuides.map(guide => (
          <image
            key={guide.value}
            href={grid.tick}
            x={guide.position - 5}
            y={BOTTOM - 1}
            width="10"
            height="14"
            aria-hidden="true"
          />
        ))}

      {points.slice(1).map((point, index) => {
        const previous = points[index];
        if (!previous || previous.isDNF || point.isDNF) return null;
        const dx = point.x - previous.x,
          dy = point.y - previous.y;
        const length = Math.hypot(dx, dy),
          angle = (Math.atan2(dy, dx) * 180) / Math.PI;
        return (
          <image
            key={`${previous.id}-${point.id}`}
            href={lines[color]}
            x={previous.x}
            y={previous.y - 6}
            width={length}
            height="12"
            preserveAspectRatio="none"
            transform={`rotate(${angle} ${previous.x} ${previous.y})`}
            aria-hidden="true"
          />
        );
      })}

      {points.map(point => (
        <image
          key={`mark-${point.id}`}
          href={point.isDNF ? pointImages.dnf : pointImages[color]}
          x={point.x - (compact ? 5 : 7)}
          y={point.y - (compact ? 5 : 7)}
          width={compact ? 10 : 14}
          height={compact ? 10 : 14}
          aria-hidden="true"
        />
      ))}

      {!compact &&
        yGuides.map(guide => (
          <text
            className="sketch-line-graph__label"
            key={`y-${guide.value}`}
            x={LEFT - 12}
            y={guide.position + 5}
            textAnchor="end"
          >
            {guide.label}
          </text>
        ))}
      {!compact &&
        xGuides.map(guide => (
          <text
            className="sketch-line-graph__label"
            key={`x-${guide.value}`}
            x={guide.position}
            y={BOTTOM + 29}
            textAnchor="middle"
          >
            {guide.label}
          </text>
        ))}

      {!compact &&
        points.map(point => (
          <g
            className="sketch-line-graph__hit"
            key={`hit-${point.id}`}
            role="button"
            tabIndex={0}
            aria-label={point.label}
            onClick={() => onSelectPoint?.(point.value)}
            onKeyDown={event => handleKey(event, point.value)}
          >
            <circle cx={point.x} cy={point.y} r="13" />
            <title>{point.label}</title>
          </g>
        ))}
    </svg>
  );
}
