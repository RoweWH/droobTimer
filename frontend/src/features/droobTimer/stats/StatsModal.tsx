import { useState } from 'react';

import { SketchHistogram, SketchLineGraph, SketchModal } from '../../../components/Sketch';
import type { ActiveSession, Solve } from '../types';
import { getSolveValue } from '../utils/averages';
import { formatTime } from '../utils/formatTime';

import { calculateStats, type StatsAverage } from './calculateStats';

import './StatsModal.css';

type StatsModalProps = {
  activeSession: ActiveSession;
  onClose: () => void;
};

function getAverageName(average: StatsAverage): string {
  return `${average.kind}${average.size}`;
}

function formatStatValue(value: number | null, activeSession: ActiveSession): string {
  if (value === null) {
    return '-';
  }

  if (activeSession.eventId === '333fm' || activeSession.eventId === 'mbld') {
    return value.toFixed(2).replace(/\.?0+$/, '');
  }

  return formatTime(value);
}

function formatSolve(solve: Solve | null, activeSession: ActiveSession): string {
  if (!solve) {
    return '-';
  }

  const value = getSolveValue(solve, activeSession);

  if (value === null) {
    return 'DNF';
  }

  if ('moves' in solve) {
    return String(value);
  }

  if ('solved' in solve) {
    const time = solve.time >= 3_600_000 ? formatTime(solve.time, false) : formatTime(solve.time);

    return `${value}/${solve.attempted} ${time}`;
  }

  return formatTime(value);
}

type ExpandedGraph = 'line' | 'histogram' | null;

export function StatsModal({ activeSession, onClose }: StatsModalProps) {
  const [expandedGraph, setExpandedGraph] = useState<ExpandedGraph>(null);
  const stats = calculateStats(activeSession);

  return (
    <SketchModal className="stats-modal" onClose={onClose} ariaLabelledBy="stats-modal-title">
      <div className="stats-modal__inner">
        <header className="stats-modal__header">
          <h2 id="stats-modal-title">{activeSession.name}</h2>

          <button
            className="stats-modal__close-button"
            type="button"
            onClick={onClose}
            aria-label="Close stats"
          >
            ×
          </button>
        </header>

        <div className="stats-modal__divider" />

        {expandedGraph !== null ? (
          <section className="stats-modal__expanded-graph">
            <div className="stats-modal__expanded-heading">
              <button type="button" onClick={() => setExpandedGraph(null)}>
                ← back
              </button>

              <h3>{expandedGraph === 'line' ? 'session times' : 'session histogram'}</h3>
            </div>

            {expandedGraph === 'line' ? (
              <SketchLineGraph solves={activeSession.solves} activeSession={activeSession} />
            ) : (
              <SketchHistogram solves={activeSession.solves} activeSession={activeSession} />
            )}
          </section>
        ) : (
          <>
        <div className="stats-modal__content">
          <section className="stats-modal__averages">
            <div className="stats-modal__average-header">
              <span />
              <h3>current</h3>
              <h3>best</h3>
            </div>

            {stats.averages.map(averageStat => (
              <div className="stats-modal__average-row" key={getAverageName(averageStat.average)}>
                <span className="stats-modal__average-name">
                  {getAverageName(averageStat.average)}
                </span>

                <span>{formatStatValue(averageStat.current, activeSession)}</span>

                <span>{formatStatValue(averageStat.best, activeSession)}</span>
              </div>
            ))}
          </section>

          <section className="stats-modal__summary">
            <h3>stats</h3>

            <div className="stats-modal__summary-row">
              <span>solves</span>
              <span>{stats.solveCount}</span>
            </div>

            <div className="stats-modal__summary-row">
              <span>best single</span>
              <span>{formatSolve(stats.bestSingle, activeSession)}</span>
            </div>

            <div className="stats-modal__summary-row">
              <span>mean</span>
              <span>{formatStatValue(stats.mean, activeSession)}</span>
            </div>

            <div className="stats-modal__summary-row">
              <span>std dev</span>
              <span>{formatStatValue(stats.standardDeviation, activeSession)}</span>
            </div>
          </section>
        </div>

        <div className="stats-modal__graph-previews">
          <SketchLineGraph
            compact
            solves={activeSession.solves}
            activeSession={activeSession}
            onExpand={() => setExpandedGraph('line')}
          />

          <SketchHistogram
            compact
            solves={activeSession.solves}
            activeSession={activeSession}
            onExpand={() => setExpandedGraph('histogram')}
          />
        </div>
          </>
        )}
      </div>
    </SketchModal>
  );
}
