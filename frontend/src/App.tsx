import { useState } from 'react';

import { Dashboard } from './components/Dashboard/Dashboard';
import { Header } from './components/Dashboard/Header/Header';
import {
  loadGeneralSettings,
  loadTimerSettings,
  saveGeneralSettings,
  saveTimerSettings,
} from './components/Settings/settingsStorage';
import { SettingsModal } from './components/Settings/SettingsModal';
import type { GeneralSettings } from './components/Settings/settingsTypes';
import type { TimerSettings } from './features/droobTimer/types';
import { ThemeProvider } from './context/ThemeContext';

import './App.css';
import { VoiceProvider } from './context/VoiceContext';

type AppContentProps = {
  generalSettings: GeneralSettings;
  timerSettings: TimerSettings;
  onChangeGeneralSettings: (settings: GeneralSettings) => void;
  onChangeTimerSettings: (settings: TimerSettings) => void;
};

function AppContent({
  generalSettings,
  timerSettings,
  onChangeGeneralSettings,
  onChangeTimerSettings,
}: AppContentProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <>
      <div className="app">
        <Header onOpenSettings={() => setIsSettingsOpen(true)} />

        <Dashboard timerSettings={timerSettings} />
      </div>

      {isSettingsOpen && (
        <SettingsModal
          generalSettings={generalSettings}
          timerSettings={timerSettings}
          onChangeGeneralSettings={onChangeGeneralSettings}
          onChangeTimerSettings={onChangeTimerSettings}
          onClose={() => setIsSettingsOpen(false)}
        />
      )}
    </>
  );
}

function App() {
  const [generalSettings, setGeneralSettings] = useState(loadGeneralSettings);

  const [timerSettings, setTimerSettings] = useState(loadTimerSettings);

  function updateGeneralSettings(nextSettings: GeneralSettings) {
    setGeneralSettings(nextSettings);
    saveGeneralSettings(nextSettings);
  }

  function updateTimerSettings(nextSettings: TimerSettings) {
    setTimerSettings(nextSettings);
    saveTimerSettings(nextSettings);
  }

  return (
    <ThemeProvider themeName={generalSettings.theme}>
      <VoiceProvider voice={generalSettings.voice}>
        <AppContent
          generalSettings={generalSettings}
          timerSettings={timerSettings}
          onChangeGeneralSettings={updateGeneralSettings}
          onChangeTimerSettings={updateTimerSettings}
        />
      </VoiceProvider>
    </ThemeProvider>
  );
}

export default App;
