import { SketchButton, SketchSelect } from '../../../components/Sketch';
import { useTheme } from '../../../context/ThemeContext';
import type { ActiveSession, Session } from '../types';

import './SolveHistoryHeader.css';

const NEW_SESSION_VALUE = 'new';

type SolveHistoryHeaderProps = {
  activeSession: ActiveSession;
  sessions: Session[];
  onChangeSession: (sessionId: number) => void;
  onCreateSession: () => void;
  onClearSession: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
};

export function SolveHistoryHeader({
  activeSession,
  sessions,
  onChangeSession,
  onCreateSession,
  onClearSession,
  onOpenStats,
  onOpenSettings,
}: SolveHistoryHeaderProps) {
  const { theme } = useTheme();

  const options = sessions.map(session => ({
    value: String(session.id),
    label: session.name,
  }));

  options.push({
    value: NEW_SESSION_VALUE,
    label: '+ new session',
  });

  function handleSessionChange(value: string) {
    if (value === NEW_SESSION_VALUE) {
      onCreateSession();
      return;
    }

    onChangeSession(Number(value));
  }

  return (
    <div className="solve-history-header">
      <div className="solve-history-header__top">
        <SketchSelect
          className="solve-history-header__session-select"
          value={String(activeSession.id)}
          options={options}
          onChange={handleSessionChange}
        />

        <button
          className="solve-history-header__settings-button"
          type="button"
          onClick={onOpenSettings}
          aria-label="session settings"
        >
          <img src={theme.assets.icons.gear} alt="" />
        </button>
      </div>

      <div className="solve-history-header__actions">
        <SketchButton onClick={onClearSession}>clear</SketchButton>

        <SketchButton onClick={onOpenStats}>stats</SketchButton>
      </div>
    </div>
  );
}
