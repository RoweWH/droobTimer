/* eslint-disable react-refresh/only-export-components */

import { createContext, useContext } from 'react';

import { VOICE_COLLECTIONS } from '../assets/audio';
import type { GeneralSettings } from '../components/Settings/settingsTypes';

type VoiceCue = keyof typeof VOICE_COLLECTIONS.alex;

type VoiceContextValue = {
  playVoice: (cue: VoiceCue) => void;
};

const VoiceContext = createContext<VoiceContextValue | null>(null);

type VoiceProviderProps = {
  voice: GeneralSettings['voice'];
  children: React.ReactNode;
};

export function VoiceProvider({ voice, children }: VoiceProviderProps) {
  function playVoice(cue: VoiceCue) {
    if (voice === 'none') {
      return;
    }

    const clips = VOICE_COLLECTIONS[voice][cue];
    const randomIndex = Math.floor(Math.random() * clips.length);
    const audio = new Audio(clips[randomIndex]);

    void audio.play().catch(() => {});
  }

  return <VoiceContext.Provider value={{ playVoice }}>{children}</VoiceContext.Provider>;
}

export function useVoice() {
  const context = useContext(VoiceContext);

  if (context === null) {
    throw new Error('useVoice must be used inside VoiceProvider.');
  }

  return context;
}
