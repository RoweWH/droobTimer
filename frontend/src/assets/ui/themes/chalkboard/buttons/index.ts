import { rounded } from './rounded';
import { bowed } from './bowed';
import { crooked } from './crooked';
import { shaky } from './shaky';
import { soft } from './soft';

import type { ButtonTheme } from '../../themeTypes';

const CHALKBOARD_BUTTON_THEMES: ButtonTheme[] = [
  {
    name: 'rounded',
    left: rounded.left,
    middle: rounded.middle,
    right: rounded.right,
  },
  {
    name: 'bowed',
    left: bowed.left,
    middle: bowed.middle,
    right: bowed.right,
  },
  {
    name: 'crooked',
    left: crooked.left,
    middle: crooked.middle,
    right: crooked.right,
  },
  {
    name: 'shaky',
    left: shaky.left,
    middle: shaky.middle,
    right: shaky.right,
  },
  {
    name: 'soft',
    left: soft.left,
    middle: soft.middle,
    right: soft.right,
  },
];

export function getRandomChalkboardButtonTheme(): ButtonTheme {
  const randomIndex = Math.floor(Math.random() * CHALKBOARD_BUTTON_THEMES.length);

  return CHALKBOARD_BUTTON_THEMES[randomIndex];
}
