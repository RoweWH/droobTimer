import { useTheme } from '../../context/ThemeContext';
import type { TimerSettings as TimerSettingsType } from '../../features/droobTimer/types';
import { SketchButton, SketchModal } from '../Sketch';

import { AppSettings } from './AppSettings';
import type { GeneralSettings } from './settingsTypes';
import { TimerSettings } from './TimerSettings';

import './SettingsModal.css';

type SettingsModalProps = {
  generalSettings: GeneralSettings;
  timerSettings: TimerSettingsType;
  onChangeGeneralSettings: (settings: GeneralSettings) => void;
  onChangeTimerSettings: (settings: TimerSettingsType) => void;
  onClose: () => void;
};

export function SettingsModal({
  generalSettings,
  timerSettings,
  onChangeGeneralSettings,
  onChangeTimerSettings,
  onClose,
}: SettingsModalProps) {
  const { theme } = useTheme();

  return (
    <SketchModal
      className="settings-modal"
      onClose={onClose}
      ariaLabelledBy="settings-modal-title"
      backdrop={theme.modalBackdrops.settings}
    >
      <div className="settings-modal__inner">
        <header className="settings-modal__header">
          <h2 id="settings-modal-title" className="settings-modal__title">
            Settings
          </h2>

          <button
            className="settings-modal__close-button"
            type="button"
            onClick={onClose}
            aria-label="Close settings"
          >
            ×
          </button>
        </header>

        <div className="settings-modal__content">
          <AppSettings settings={generalSettings} onChange={onChangeGeneralSettings} />

          <TimerSettings settings={timerSettings} onChange={onChangeTimerSettings} />
        </div>

        <div className="settings-modal__actions">
          <SketchButton type="button" onClick={onClose}>
            done
          </SketchButton>
        </div>
      </div>
    </SketchModal>
  );
}
