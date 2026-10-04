import { chalkboardTheme } from './chalkboard';
import { paperTheme } from './paper';

export const THEME_NAMES = ['paper', 'chalkboard'] as const;
export type ThemeName = (typeof THEME_NAMES)[number];

export const DEFAULT_THEME_NAME: ThemeName = 'paper';

const themes = {
  paper: paperTheme,
  chalkboard: chalkboardTheme,
};

export function getTheme(themeName: ThemeName) {
  return themes[themeName];
}
