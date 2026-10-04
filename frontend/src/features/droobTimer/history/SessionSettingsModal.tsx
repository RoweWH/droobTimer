import { useState } from 'react';

import { SketchButton, SketchInput, SketchModal, SketchSelect } from '../../../components/Sketch';
import { useTheme } from '../../../context/ThemeContext';
import type { WcaEventId } from '../../../tdrooble';
import { AVERAGE_DISPLAYS, WCA_EVENTS, type ActiveSession, type MbldDisplayValue } from '../types';

import './SessionSettingsModal.css';

function getEventName(eventId: WcaEventId) {
  return WCA_EVENTS.find(event => event.value === eventId)?.label ?? eventId;
}

type SessionSettingsModalProps = {
  activeSession: ActiveSession;
  onClose: () => void;
  onUpdate: (session: ActiveSession) => void;
  onDelete: () => void | Promise<void>;
};

export function SessionSettingsModal({
  activeSession,
  onClose,
  onUpdate,
  onDelete,
}: SessionSettingsModalProps) {
  const { theme } = useTheme();

  const [session, setSession] = useState<ActiveSession>(() => ({
    ...activeSession,
    name: activeSession.name || getEventName(activeSession.eventId),
    phases: [...activeSession.phases],
  }));

  const eventOptions = WCA_EVENTS.map(event => ({
    value: event.value,
    label: event.label,
  }));

  const averageOptions = AVERAGE_DISPLAYS.map(value => ({
    value,
    label: value,
  }));

  const mbldDisplayOptions = [
    {
      value: 'wca',
      label: 'WCA',
    },
    {
      value: 'oldStyle',
      label: 'old style',
    },
  ];

  function updateSession(updates: Partial<ActiveSession>) {
    const updatedSession = {
      ...session,
      ...updates,
    };

    setSession(updatedSession);
    onUpdate(updatedSession);
  }

  function handleEventChange(nextEventId: WcaEventId) {
    if (nextEventId === session.eventId) {
      return;
    }

    const hasSolves = session.solves.length > 0;

    if (hasSolves) {
      const shouldReset = window.confirm(
        'Changing the event will reset the times in this session. Do you want to continue?'
      );

      if (!shouldReset) {
        return;
      }
    }

    const updatedSession = {
      ...session,
      eventId: nextEventId,
      name: getEventName(nextEventId),
      solves: hasSolves ? [] : session.solves,
      mbldDisplayValue: nextEventId === 'mbld' ? 'wca' : undefined,
    } satisfies ActiveSession;

    setSession(updatedSession);
    onUpdate(updatedSession);
  }

  function handleNameChange(name: string) {
    updateSession({ name });
  }

  function addPhase() {
    const phases =
      session.phases.length === 0
        ? ['phase 1', 'phase 2']
        : [...session.phases, `phase ${session.phases.length + 1}`];

    updateSession({ phases });
  }

  function removePhase(index: number) {
    const phases =
      session.phases.length === 2
        ? []
        : session.phases.filter((_, phaseIndex) => phaseIndex !== index);

    updateSession({ phases });
  }

  function renamePhase(index: number, name: string) {
    const phases = session.phases.map((phase, phaseIndex) => (phaseIndex === index ? name : phase));

    updateSession({ phases });
  }

  async function handleDelete() {
    const shouldDelete = window.confirm(`Delete "${session.name}" and all of its solves?`);

    if (!shouldDelete) {
      return;
    }

    await onDelete();
  }

  return (
    <SketchModal
      className="session-settings-modal"
      onClose={onClose}
      ariaLabelledBy="session-settings-modal-title"
      backdrop={theme.modalBackdrops.sessionSettings}
    >
      <div className="session-settings-modal__inner">
        <header className="session-settings-modal__header">
          <h2 id="session-settings-modal-title" className="session-settings-modal__title">
            Session Settings
          </h2>

          <button
            className="session-settings-modal__close-button"
            type="button"
            onClick={onClose}
            aria-label="Close session settings"
          >
            ×
          </button>
        </header>

        <div className="session-settings-modal__content">
          <section className="session-settings-modal__feature-section">
            <div className="session-settings-modal__setting-group">
              <h4 className="session-settings-modal__section-title">event</h4>

              <SketchSelect
                value={session.eventId}
                options={eventOptions}
                onChange={handleEventChange}
              />
            </div>
          </section>

          <section className="session-settings-modal__feature-section">
            <div className="session-settings-modal__setting-group">
              <h4 className="session-settings-modal__section-title">name</h4>

              <SketchInput
                value={session.name}
                onChange={event => handleNameChange(event.target.value)}
              />
            </div>
          </section>

          <section className="session-settings-modal__feature-section">
            <div className="session-settings-modal__setting-group">
              <h4 className="session-settings-modal__section-title">phasing</h4>

              <div className="session-settings-modal__phase-list">
                {session.phases.map((phase, index) => (
                  <div key={index} className="session-settings-modal__phase-row">
                    <SketchInput
                      value={phase}
                      onChange={event => renamePhase(index, event.target.value)}
                    />

                    <button
                      className="session-settings-modal__remove-phase"
                      type="button"
                      onClick={() => removePhase(index)}
                      aria-label={`Remove ${phase}`}
                    >
                      remove
                    </button>
                  </div>
                ))}
              </div>

              <SketchButton
                type="button"
                onClick={addPhase}
                className="session-settings-modal__add-phase"
              >
                add phase
              </SketchButton>
            </div>
          </section>

          {session.eventId === 'mbld' && (
            <section className="session-settings-modal__feature-section">
              <div className="session-settings-modal__setting-group">
                <h4 className="session-settings-modal__section-title">result format</h4>

                <SketchSelect
                  value={session.mbldDisplayValue ?? 'wca'}
                  options={mbldDisplayOptions}
                  onChange={value =>
                    updateSession({
                      mbldDisplayValue: value as MbldDisplayValue,
                    })
                  }
                />
              </div>
            </section>
          )}

          <section className="session-settings-modal__feature-section">
            <div className="session-settings-modal__setting-group">
              <h4 className="session-settings-modal__section-title">average displays</h4>

              <div className="session-settings-modal__two-column">
                <div className="session-settings-modal__average-group">
                  <label className="session-settings-modal__average-label">first</label>

                  <SketchSelect
                    value={session.firstAverage}
                    options={averageOptions}
                    onChange={value =>
                      updateSession({
                        firstAverage: value,
                      })
                    }
                  />
                </div>

                <div className="session-settings-modal__average-group">
                  <label className="session-settings-modal__average-label">second</label>

                  <SketchSelect
                    value={session.secondAverage}
                    options={averageOptions}
                    onChange={value =>
                      updateSession({
                        secondAverage: value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="session-settings-modal__actions">
          <SketchButton type="button" onClick={handleDelete}>
            delete session
          </SketchButton>

          <SketchButton type="button" onClick={onClose}>
            save
          </SketchButton>
        </div>
      </div>
    </SketchModal>
  );
}
