import type { ThemeName } from '../../assets/ui/themes/themeRegistry';
import { DEFAULT_THEME_NAME } from '../../assets/ui/themes/themeRegistry';

export type GeneralSettings = {
  theme: ThemeName;
  voice: (typeof VOICE_OPTIONS)[number];
};

export const DEFAULT_GENERAL_SETTINGS: GeneralSettings = {
  theme: DEFAULT_THEME_NAME,
  voice: 'alex',
};

export const VOICE_OPTIONS = ['none', 'alex', 'gert'] as const;

