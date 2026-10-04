import type { WcaEventId } from '../../../tdrooble';
import { WCA_EVENTS, type AverageDisplay, type Session } from '../types';
import { getSessions, saveSession } from './database';

const AO5_AO12_EVENTS = new Set<WcaEventId>([
  '222',
  '333',
  '444',
  '555',
  '333oh',
  'minx',
  'pyram',
  'skewb',
  'sq1',
  'clock',
]);

function getEventName(eventId: WcaEventId): string {
  return WCA_EVENTS.find(event => event.value === eventId)?.label ?? eventId;
}

function getDefaultAverages(eventId: WcaEventId): [AverageDisplay, AverageDisplay] {
  return AO5_AO12_EVENTS.has(eventId) ? ['ao5', 'ao12'] : ['mo3', 'ao5'];
}

export function createDefaultSession(eventId: WcaEventId): Session {
  const [firstAverage, secondAverage] = getDefaultAverages(eventId);
  const now = Date.now();

  return {
    id: now,
    name: getEventName(eventId),
    eventId,
    firstAverage,
    secondAverage,
    phases: [],
    lastAccessed: now,
    ...(eventId === 'mbld' && {
      mbldDisplayValue: 'wca',
    }),
  };
}

export async function ensureDefaultSession(): Promise<Session> {
  const sessions = await getSessions();

  if (sessions.length > 0) {
    return sessions[0];
  }

  const defaultSession = createDefaultSession('333');
  await saveSession(defaultSession);
  return defaultSession;
}
