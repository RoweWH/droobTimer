import { THEME_NAMES } from '../../assets/ui/themes/themeRegistry';
import {
  DEFAULT_TIMER_SETTINGS,
  EVENTS,
  INPUT_METHODS,
  INSPECTION_MODES,
  TIMER_UPDATES,
  type EventId,
  type TimerSettings,
} from '../../features/droobTimer/types';

import { DEFAULT_GENERAL_SETTINGS, VOICE_OPTIONS, type GeneralSettings } from './settingsTypes';

const GENERAL_SETTINGS_STORAGE_KEY = 'droobtimer-general-settings';
const TIMER_SETTINGS_STORAGE_KEY = 'droobtimer-timer-settings';

const EVENT_IDS = EVENTS.map(event => event.id);

export function loadGeneralSettings(): GeneralSettings {
  try {
    const storedSettings = JSON.parse(localStorage.getItem(GENERAL_SETTINGS_STORAGE_KEY) ?? '{}');

    return {
      theme: THEME_NAMES.includes(storedSettings.theme)
        ? storedSettings.theme
        : DEFAULT_GENERAL_SETTINGS.theme,

      voice: VOICE_OPTIONS.includes(storedSettings.voice)
        ? storedSettings.voice
        : DEFAULT_GENERAL_SETTINGS.voice,
    };
  } catch {
    return DEFAULT_GENERAL_SETTINGS;
  }
}

export function saveGeneralSettings(settings: GeneralSettings) {
  localStorage.setItem(GENERAL_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function loadTimerSettings(): TimerSettings {
  try {
    const storedSettings = JSON.parse(localStorage.getItem(TIMER_SETTINGS_STORAGE_KEY) ?? '{}');

    const storedInput = storedSettings.input ?? storedSettings.inputMethod;

    const storedInspection = storedSettings.inspection ?? storedSettings.inspectionMode;

    const storedExceptions =
      storedSettings.exceptions ?? storedSettings.exception ?? storedSettings.exceptionEvents;

    return {
      input: INPUT_METHODS.includes(storedInput) ? storedInput : DEFAULT_TIMER_SETTINGS.input,

      inspection: INSPECTION_MODES.includes(storedInspection)
        ? storedInspection
        : DEFAULT_TIMER_SETTINGS.inspection,

      exceptions: Array.isArray(storedExceptions)
        ? storedExceptions.filter((eventId: unknown): eventId is EventId =>
            EVENT_IDS.includes(eventId as EventId)
          )
        : DEFAULT_TIMER_SETTINGS.exceptions,

      update: TIMER_UPDATES.includes(storedSettings.update)
        ? storedSettings.update
        : DEFAULT_TIMER_SETTINGS.update,
    };
  } catch {
    return DEFAULT_TIMER_SETTINGS;
  }
}

export function saveTimerSettings(settings: TimerSettings) {
  localStorage.setItem(TIMER_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
