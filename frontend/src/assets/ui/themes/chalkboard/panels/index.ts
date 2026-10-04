import { bowed } from './bowed';
import { crooked } from './crooked';
import { leaning } from './leaning';
import { loose } from './loose';
import { wobble } from './wobble';

import type { PanelTheme } from '../../themeTypes';

const panelThemes: PanelTheme[] = [bowed, crooked, leaning, loose, wobble];

export function getRandomChalkboardPanelTheme(): PanelTheme {
  const randomIndex = Math.floor(Math.random() * panelThemes.length);
  return panelThemes[randomIndex];
}
