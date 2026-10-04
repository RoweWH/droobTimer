import { clock } from './clock';
import { megaminx } from './megaminx';
import { skewb } from './skewb';
import { sq1 } from './sq1';
import { cube } from './cube';
import { pyraminx } from './pyraminx';

export const drawScramble = {
  clock,
  megaminx,
  skewb,
  sq1,
  cube,
  pyraminx,
} as const;
