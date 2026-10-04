import { THEME_NAMES } from '../../assets/ui/themes/themeRegistry';
import { useVoice } from '../../context/VoiceContext';
import { SketchSelect } from '../Sketch';

import { VOICE_OPTIONS, type GeneralSettings } from './settingsTypes';

const themeOptions = THEME_NAMES.map(theme => ({
  value: theme,
  label: theme,
}));

const voiceOptions = VOICE_OPTIONS.map(voice => ({
  value: voice,
  label: voice === 'none' ? 'none' : voice === 'alex' ? 'Stheven' : 'Sthephen',
}));

type AppSettingsProps = {
  settings: GeneralSettings;
  onChange: (settings: GeneralSettings) => void;
};

export function AppSettings({ settings, onChange }: AppSettingsProps) {
  const { playVoice } = useVoice();

  function changeTheme(theme: GeneralSettings['theme']) {
    onChange({
      ...settings,
      theme,
    });
  }

  function changeVoice(voice: GeneralSettings['voice']) {
    onChange({
      ...settings,
      voice,
    });
  }

  function testVoice() {
    playVoice('eight');
  }

  return (
    <section className="settings-modal__feature-section">
      <div className="settings-modal__setting-group">
        <h4 className="settings-modal__section-title">Theme</h4>

        <SketchSelect value={settings.theme} options={themeOptions} onChange={changeTheme} />
      </div>

      <div className="settings-modal__setting-group">
        <h4 className="settings-modal__section-title">Voice</h4>

        <div className="settings-modal__voice-row">
          <SketchSelect value={settings.voice} options={voiceOptions} onChange={changeVoice} />

          <button
            className="settings-modal__voice-test"
            type="button"
            disabled={settings.voice === 'none'}
            onClick={testVoice}
            aria-label="Test selected voice"
            title="Test voice"
          >
            ▶
          </button>
        </div>
      </div>
    </section>
  );
}
