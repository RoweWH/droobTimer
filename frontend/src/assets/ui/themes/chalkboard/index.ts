import { backgrounds } from './backgrounds';
import { getRandomChalkboardBestCircle } from './best-circles';
import { getRandomChalkboardButtonTheme } from './buttons';
import { colorPicker } from './colorpicker';
import { drawScramble } from './drawscramble';
import { histogram } from './histogram';
import { lineGraph } from './linegraph';
import { dividers } from './dividers';
import logo from './logo.svg';
import { getRandomChalkboardPanelTheme } from './panels';
import { pieChart } from './piechart';
import { sliders } from './sliders';
import { icons } from './icons';

export const chalkboardTheme = {
  name: 'chalkboard',
  label: 'Chalkboard',

  assets: {
    backgrounds,
    logo,
    icons,
    getRandomButtonTheme: getRandomChalkboardButtonTheme,
    getRandomPanelTheme: getRandomChalkboardPanelTheme,
    getRandomBestCircle: getRandomChalkboardBestCircle,
    colorPicker,
    drawScramble,
    histogram,
    lineGraph,
    pieChart,
    sliders,
    dividers,
  },

  modalBackdrops: {
    settings: backgrounds.green,
    sessionSettings: backgrounds.green,
    average: backgrounds.green,
    solve: backgrounds.blue,
    notes: backgrounds.green,
    mbldScramble: backgrounds.blue,
  },
} as const;
