import { useEffect, useRef, useState } from 'react';

import {
  generatePuzzle,
  type GeneratedPuzzle,
  type WcaEventId,
} from '../../../tdrooble';

import {
  DrawScramblePanel,
  type DrawScrambleMode,
} from '../../../features/droobTimer/drawScramble/DrawScramblePanel';

import { SolveHistory } from '../../../features/droobTimer/history/SolveHistory';
import { SessionSettingsModal } from '../../../features/droobTimer/history/SessionSettingsModal';
import { Scrambler } from '../../../features/droobTimer/scrambler/Scrambler';

import {
  createDefaultSession,
  deleteSession,
  ensureDefaultSession,
  getActiveSession,
  getSavedActiveSessionId,
  getSessions,
  saveActiveSessionId,
  saveSession,
  syncSolves,
} from '../../../features/droobTimer/storage';

import { StandardTimer, MBLDTimer } from '../../../features/droobTimer/timers';
import type { ActiveSession, Session, TimerSettings } from '../../../features/droobTimer/types';

import { SketchDivider, SketchPanel } from '../../Sketch';

import './CenterPanel.css';

type CenterPanelProps = {
  timerSettings: TimerSettings;
};

function toSession(activeSession: ActiveSession): Session {
  const { solves: _, ...session } = activeSession;
  return session;
}

function getMostRecentSession(sessions: Session[]): Session | undefined {
  return [...sessions].sort((a, b) => (b.lastAccessed ?? 0) - (a.lastAccessed ?? 0))[0];
}

export function CenterPanel({ timerSettings }: CenterPanelProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [scramble, setScramble] = useState<GeneratedPuzzle | null>(null);
  const [previousPuzzle, setPreviousPuzzle] = useState<GeneratedPuzzle | null>(null);
  const [drawScrambleMode, setDrawScrambleMode] = useState<DrawScrambleMode>('background');
  const [isSessionSettingsOpen, setIsSessionSettingsOpen] = useState(false);

  const [mbldCubeCount, setMbldCubeCount] = useState('5');
  const [isGenerating, setIsGenerating] = useState(false);
  const [scrambleVersion, setScrambleVersion] = useState(0);

  const generationId = useRef(0);
  const nextScramble = useRef<Promise<GeneratedPuzzle> | null>(null);
  const advancing = useRef(false);
  const currentScramble = useRef<GeneratedPuzzle | null>(null);
  const currentPrevious = useRef<GeneratedPuzzle | null>(null);

  const eventId = activeSession?.eventId;
  const cubeCount = eventId === 'mbld' ? Math.min(100, Math.max(2, Number(mbldCubeCount) || 2)) : 1;

  function startPreparing(id: WcaEventId, count: number) {
    const promise = generatePuzzle(id, count);

    // Attach a rejection handler immediately so a background failure
    // is not unhandled.
    void promise.catch(() => {});

    nextScramble.current = promise;
  }

  useEffect(() => {
    if (!eventId) return;

    const id = ++generationId.current;

    nextScramble.current = null;
    advancing.current = false;
    currentScramble.current = null;
    currentPrevious.current = null;

    setScramble(null);
    setPreviousPuzzle(null);
    setIsGenerating(true);

    async function initialize() {
      try {
        const initial = await generatePuzzle(eventId!, cubeCount);

        if (id !== generationId.current) return;

        currentScramble.current = initial;
        setScramble(initial);

        startPreparing(eventId!, cubeCount);
      } catch (error) {
        console.error('Unable to generate scramble:', error);
      } finally {
        if (id === generationId.current) {
          setIsGenerating(false);
        }
      }
    }

    void initialize();

    return () => {
      generationId.current++;
    };
  }, [eventId, cubeCount, scrambleVersion]);

  async function advanceScramble() {
    if (!eventId || advancing.current) return;

    advancing.current = true;
    setIsGenerating(true);

    const id = generationId.current;

    try {
      const prepared = nextScramble.current ?? generatePuzzle(eventId, cubeCount);

      nextScramble.current = null;

      const result = await prepared;

      if (id !== generationId.current) return;

      currentPrevious.current = currentScramble.current;
      setPreviousPuzzle(currentPrevious.current);

      currentScramble.current = result;
      setScramble(result);

      startPreparing(eventId, cubeCount);
    } catch (error) {
      console.error('Unable to advance scramble:', error);

      if (id === generationId.current) {
        startPreparing(eventId, cubeCount);
      }
    } finally {
      if (id === generationId.current) {
        advancing.current = false;
        setIsGenerating(false);
      }
    }
  }

  function showPreviousPuzzle() {
    if (!currentPrevious.current || advancing.current) return;

    const previous = currentPrevious.current;

    currentScramble.current = previous;
    currentPrevious.current = null;

    setScramble(previous);
    setPreviousPuzzle(null);

    if (previous.eventId === 'mbld' && Array.isArray(previous.scramble)) {
      setMbldCubeCount(String(previous.scramble.length));
    }
  }

  function completeSolve() {
    void advanceScramble();
  }

  function resetScramble() {
    // Session changes with the same event still require a fresh scramble.
    setScrambleVersion(value => value + 1);
  }

  useEffect(() => {
    async function loadSessions() {
      await ensureDefaultSession();

      const storedSessions = await getSessions();
      const savedSessionId = getSavedActiveSessionId();

      const savedSession = storedSessions.find(session => session.id === savedSessionId);

      const session = savedSession ?? getMostRecentSession(storedSessions);

      if (!session) return;

      const loadedSession = await getActiveSession(session.id);

      if (!loadedSession) return;

      const accessedSession = {
        ...loadedSession,
        lastAccessed: Date.now(),
      };

      await saveSession(toSession(accessedSession));

      setSessions(
        storedSessions.map(storedSession =>
          storedSession.id === accessedSession.id ? toSession(accessedSession) : storedSession
        )
      );

      setActiveSession(accessedSession);
      saveActiveSessionId(accessedSession.id);
    }

    void loadSessions();
  }, []);

  async function updateSession(updatedSession: ActiveSession) {
    if (updatedSession.eventId !== activeSession?.eventId) {
      resetScramble();
    }

    setActiveSession(updatedSession);

    setSessions(current =>
      current.map(session =>
        session.id === updatedSession.id ? toSession(updatedSession) : session
      )
    );

    await saveSession(toSession(updatedSession));
    await syncSolves(updatedSession.id, updatedSession.solves);
  }

  async function changeEvent(nextEventId: WcaEventId) {
    const matchingSessions = sessions.filter(session => session.eventId === nextEventId);

    let nextSession = getMostRecentSession(matchingSessions);

    if (!nextSession) {
      nextSession = createDefaultSession(nextEventId);

      await saveSession(nextSession);

      setSessions(current => [...current, nextSession!]);
    }

    const loadedSession = await getActiveSession(nextSession.id);

    if (!loadedSession) return;

    const accessedSession = {
      ...loadedSession,
      lastAccessed: Date.now(),
    };

    await saveSession(toSession(accessedSession));

    setSessions(current => {
      const exists = current.some(session => session.id === accessedSession.id);

      if (!exists) {
        return [...current, toSession(accessedSession)];
      }

      return current.map(session =>
        session.id === accessedSession.id ? toSession(accessedSession) : session
      );
    });

    setActiveSession(accessedSession);
    resetScramble();

    saveActiveSessionId(accessedSession.id);

  }

  async function changeSession(sessionId: number) {
    const loadedSession = await getActiveSession(sessionId);

    if (!loadedSession) return;

    const accessedSession = {
      ...loadedSession,
      lastAccessed: Date.now(),
    };

    await saveSession(toSession(accessedSession));

    setSessions(current =>
      current.map(session =>
        session.id === accessedSession.id ? toSession(accessedSession) : session
      )
    );

    setActiveSession(accessedSession);
    resetScramble();

    saveActiveSessionId(accessedSession.id);
  }

  async function createSession() {
    if (!activeSession) return;

    const newSession = createDefaultSession(activeSession.eventId);

    await saveSession(newSession);

    setSessions(current => [...current, newSession]);

    setActiveSession({
      ...newSession,
      solves: [],
    });

    resetScramble();

    saveActiveSessionId(newSession.id);
    setIsSessionSettingsOpen(true);
  }

  function clearSession() {
    if (!activeSession) return;

    void updateSession({
      ...activeSession,
      solves: [],
    });
  }

  async function removeSession() {
    if (!activeSession) return;

    await deleteSession(activeSession.id);

    const remainingSessions = sessions.filter(session => session.id !== activeSession.id);

    if (remainingSessions.length === 0) {
      const newSession = createDefaultSession('333');

      await saveSession(newSession);

      setSessions([newSession]);

      setActiveSession({
        ...newSession,
        solves: [],
      });

      saveActiveSessionId(newSession.id);
    } else {
      const nextSession = getMostRecentSession(remainingSessions) ?? remainingSessions[0];

      const loadedSession = await getActiveSession(nextSession.id);

      if (!loadedSession) return;

      setSessions(remainingSessions);
      setActiveSession(loadedSession);

      saveActiveSessionId(loadedSession.id);
    }

    resetScramble();
    setIsSessionSettingsOpen(false);
  }

  if (!activeSession) return null;

  return (
    <main className="center-panel">
      <SketchPanel className="center-panel__content" backdrop="">
        <div className="center-panel__scrambler">
          <Scrambler
            eventId={activeSession.eventId}
            puzzle={scramble}
            previousPuzzle={previousPuzzle}
            onEventChange={changeEvent}
            isGenerating={isGenerating}
            mbldCubeCount={mbldCubeCount}
            onMbldCubeCountChange={setMbldCubeCount}
            onNextScramble={advanceScramble}
            onPreviousPuzzle={showPreviousPuzzle}
          />
        </div>

        <SketchDivider />

        <div className="center-panel__main">
          <div className="center-panel__timer">
            {activeSession.eventId === 'mbld' ? (
              <MBLDTimer
                session={activeSession}
                puzzle={scramble}
                timerSettings={timerSettings}
                onUpdateSession={updateSession}
                onSolveComplete={completeSolve}
              />
            ) : (
              <StandardTimer
                session={activeSession}
                puzzle={scramble}
                timerSettings={timerSettings}
                onUpdateSession={updateSession}
                onSolveComplete={completeSolve}
              />
            )}

            {scramble && (
              <div className="center-panel__draw-scramble">
                <DrawScramblePanel
                  puzzle={scramble}
                  mode={drawScrambleMode}
                  onModeChange={setDrawScrambleMode}
                />
              </div>
            )}
          </div>

          <div className="center-panel__history">
            <SolveHistory
              activeSession={activeSession}
              sessions={sessions}
              onUpdateSession={updateSession}
              onChangeSession={changeSession}
              onCreateSession={createSession}
              onClearSession={clearSession}
              onOpenSettings={() => setIsSessionSettingsOpen(true)}
            />
          </div>
        </div>
      </SketchPanel>

      {isSessionSettingsOpen && (
        <SessionSettingsModal
          activeSession={activeSession}
          onClose={() => setIsSessionSettingsOpen(false)}
          onUpdate={updateSession}
          onDelete={removeSession}
        />
      )}
    </main>
  );
}
