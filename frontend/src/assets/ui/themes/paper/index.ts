import { backgrounds } from './backgrounds';
import { getRandomPaperBestCircle } from './best-circles';
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
  name: 'paper',
  label: 'Paper',

  assets: {
    backgrounds,
    logo,
    icons,
    getRandomButtonTheme: getRandomPaperButtonTheme,
    getRandomPanelTheme: getRandomPaperPanelTheme,
    getRandomBestCircle: getRandomPaperBestCircle,
    colorPicker,
    drawScramble,
    histogram,
    lineGraph,
    pieChart,
    dividers,
    sliders,
  },

  modalBackdrops: {
    settings: backgrounds.lightOrange,
    sessionSettings: backgrounds.lightOrange,
    average: backgrounds.lightPurple,
    solve: backgrounds.lightBlue,
    notes: backgrounds.white,
    mbldScramble: backgrounds.lightPink,
  },
} as const;
