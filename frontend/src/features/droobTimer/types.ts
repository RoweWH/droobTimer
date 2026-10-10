import type { GeneratedPuzzle, WcaEventId } from '../../tdrooble';

export const EVENTS = [
  { id: '222', name: '2x2' },
  { id: '333', name: '3x3' },
  { id: '444', name: '4x4' },
  { id: '555', name: '5x5' },
  { id: '666', name: '6x6' },
  { id: '777', name: '7x7' },
  { id: '333oh', name: 'OH' },
  { id: '333bf', name: '3BLD' },
  { id: '333fm', name: 'FMC' },
  { id: 'mbld', name: 'MBLD' },
  { id: '444bf', name: '4BLD' },
  { id: '555bf', name: '5BLD' },
  { id: 'clock', name: 'Clock' },
  { id: 'minx', name: 'Mega' },
  { id: 'pyram', name: 'Pyra' },
  { id: 'skewb', name: 'Skewb' },
  { id: 'sq1', name: 'Sq1' },
] as const;

export type EventId = (typeof EVENTS)[number]['id'];

export type MbldDisplayValue = 'wca' | 'oldStyle';

export type Phase = {
  name: string;
  value: number | null;
};

type BaseSolve = {
  id: number;
  sessionId: number;
  isDNF: boolean;
  note?: string;
  createdAt: number;
  puzzle: GeneratedPuzzle;
};

export type TimedSolve = BaseSolve & {
  time: number;
  plusTwoCount: number;
  phases: Phase[];
};

export type MbldSolve = BaseSolve & {
  time: number;
  solved: number;
  attempted: number;
  plusTwoCount: number;
  solvedAtHour: number;
  phases: Phase[];
};

export type FmcSolve = BaseSolve & {
  moves: number;
  solution: string;
};

export type Solve = TimedSolve | MbldSolve | FmcSolve;

export type Session = {
  id: number;
  name: string;
  eventId: WcaEventId;
  firstAverage: AverageDisplay;
  secondAverage: AverageDisplay;
  phases: string[];
  lastAccessed: number;
  mbldDisplayValue?: MbldDisplayValue;
};

export type ActiveSession = Session & {
  solves: Solve[];
};

export const WCA_EVENTS: {
  value: WcaEventId;
  label: string;
}[] = [
  { value: '333', label: '3x3' },
  { value: '222', label: '2x2' },
  { value: '444', label: '4x4' },
  { value: '555', label: '5x5' },
  { value: '666', label: '6x6' },
  { value: '777', label: '7x7' },
  { value: '333oh', label: 'OH' },
  { value: '333bf', label: '3BLD' },
  { value: '333fm', label: 'FMC' },
  { value: 'minx', label: 'Mega' },
  { value: 'pyram', label: 'Pyra' },
  { value: 'skewb', label: 'Skewb' },
  { value: 'sq1', label: 'SQ1' },
  { value: 'clock', label: 'Clock' },
  { value: '444bf', label: '4BLD' },
  { value: '555bf', label: '5BLD' },
  { value: 'mbld', label: 'MBLD' },
];

export type StopwatchStatus = 'idle' | 'running';

export type InspectionPenalty = 'none' | 'plusTwo' | 'dnf';

export type StopwatchResult = {
  time: number;
  inspectionPenalty: InspectionPenalty;
  phases: Phase[];
};

export type StopwatchInputProps = {
  status: StopwatchStatus;

  inspectionEnabled: boolean;
  isInspecting: boolean;

  phaseCount: number;
  onPhaseValuesChange: (values: (number | null)[]) => void;

  onStartInspection: () => void;
  onStart: () => void;
  onTimeUpdate: (time: number | null) => void;
  onStop: (time: number) => void;
  onCancel?: () => void;
};

export const INPUT_METHODS = ['spacebar', 'manual', 'stackmat', 'gan'] as const;

export const INSPECTION_MODES = ['none', 'wca', 'droob'] as const;

export const TIMER_UPDATES = ['none', 'x', '.x', '.xx'] as const;

export type TimerSettings = {
  input: (typeof INPUT_METHODS)[number];
  inspection: (typeof INSPECTION_MODES)[number];
  exceptions: EventId[];
  update: (typeof TIMER_UPDATES)[number];
};

export const DEFAULT_TIMER_SETTINGS: TimerSettings = {
  input: 'spacebar',
  inspection: 'none',
  exceptions: ['333bf'],
  update: '.xx',
};

export const NON_INSPECTION_EVENTS: EventId[] = ['333fm', 'mbld', '444bf', '555bf'];

export const AVERAGE_DISPLAYS = [
  'mo3',
  'ao5',
  'ao12',
  'ao25',
  'ao50',
  'ao100',
  'ao200',
  'ao500',
  'ao1000',
] as const;

export type AverageDisplay = (typeof AVERAGE_DISPLAYS)[number];
