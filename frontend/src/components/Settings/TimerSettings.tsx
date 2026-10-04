import {
  EVENTS,
  INPUT_METHODS,
  INSPECTION_MODES,
  NON_INSPECTION_EVENTS,
  TIMER_UPDATES,
  type EventId,
  type TimerSettings as TimerSettingsType,
} from '../../features/droobTimer/types';
import { SketchSelect } from '../Sketch';

const inputOptions = INPUT_METHODS.map(value => ({
  value,
  label: value,
}));

const inspectionOptions = INSPECTION_MODES.map(value => ({
  value,
  label: value,
}));

const updateOptions = TIMER_UPDATES.map(value => ({
  value,
  label: value,
}));

type TimerSettingsProps = {
  settings: TimerSettingsType;
  onChange: (settings: TimerSettingsType) => void;
};

export function TimerSettings({ settings, onChange }: TimerSettingsProps) {
  function updateSettings(changes: Partial<TimerSettingsType>) {
    onChange({
      ...settings,
      ...changes,
    });
  }

  function toggleException(eventId: EventId) {
    if (NON_INSPECTION_EVENTS.includes(eventId)) {
      return;
    }

    const isException = settings.exceptions.includes(eventId);

    const exceptions = isException
      ? settings.exceptions.filter(currentEventId => currentEventId !== eventId)
      : [...settings.exceptions, eventId];

    updateSettings({ exceptions });
  }

  return (
    <section className="settings-modal__feature-section">
      <div className="settings-modal__setting-group">
        <h4 className="settings-modal__section-title">Input</h4>

        <SketchSelect
          value={settings.input}
          options={inputOptions}
          onChange={input => updateSettings({ input })}
        />
      </div>

      <div className="settings-modal__setting-group">
        <h4 className="settings-modal__section-title">Inspection</h4>

        <SketchSelect
          value={settings.inspection}
          options={inspectionOptions}
          onChange={inspection => updateSettings({ inspection })}
        />

        {settings.inspection !== 'none' && (
          <div className="settings-modal__inspection-exceptions">
            <p className="settings-modal__inspection-exceptions-label">Except:</p>

            <div
              className="settings-modal__inspection-event-list"
              aria-label="Events without inspection"
            >
              {EVENTS.map(event => {
                const isRequired = NON_INSPECTION_EVENTS.includes(event.id);

                const isExcluded = isRequired || settings.exceptions.includes(event.id);

                return (
                  <label
                    key={event.id}
                    className={`settings-modal__inspection-event${
                      isExcluded ? ' is-excluded' : ''
                    }${isRequired ? ' is-required' : ''}`}
                    title={
                      isRequired
                        ? `${event.name} never uses inspection`
                        : `${isExcluded ? 'Enable' : 'Disable'} inspection for ${event.name}`
                    }
                  >
                    <input
                      className="settings-modal__inspection-event-input"
                      type="checkbox"
                      checked={isExcluded}
                      disabled={isRequired}
                      onChange={() => toggleException(event.id)}
                      aria-label={`${event.name}: ${
                        isExcluded ? 'inspection disabled' : 'inspection enabled'
                      }`}
                    />

                    <span className="settings-modal__inspection-event-label">{event.name}</span>

                    {isExcluded && (
                      <span className="settings-modal__inspection-event-x" aria-hidden="true">
                        ×
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="settings-modal__setting-group">
        <h4 className="settings-modal__section-title">Update</h4>

        <SketchSelect
          value={settings.update}
          options={updateOptions}
          onChange={update => updateSettings({ update })}
        />
      </div>
    </section>
  );
}
