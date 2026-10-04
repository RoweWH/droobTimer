import { getRandomPaperButtonTheme } from './buttons';
import { colorPicker } from './colorpicker';
import { drawScramble } from './drawscramble';
import { dividers } from './dividers';
import { histogram } from './histogram';
import { lineGraph } from './linegraph';
import logo from './logo.svg';
import { getRandomPaperPanelTheme } from './panels';
import { pieChart } from './piechart';
import { sliders } from './sliders';
import { icons } from './icons';

export const paperTheme = {
  name: 'whiteboard',
  label: 'Whiteboard',

  assets: {
    logo,
    icons,
    getRandomButtonTheme: getRandomPaperButtonTheme,
    getRandomPanelTheme: getRandomPaperPanelTheme,
    colorPicker,
    drawScramble,
    histogram,
    lineGraph,
    pieChart,
    dividers,
    sliders,
  },
} as const;
