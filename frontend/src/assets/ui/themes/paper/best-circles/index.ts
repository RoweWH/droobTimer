import circle1 from './circle-1.svg';
import circle2 from './circle-2.svg';
import circle3 from './circle-3.svg';
import circle4 from './circle-4.svg';
import circle5 from './circle-5.svg';

const PAPER_BEST_CIRCLES = [circle1, circle2, circle3, circle4, circle5];

export function getRandomPaperBestCircle(): string {
  const randomIndex = Math.floor(Math.random() * PAPER_BEST_CIRCLES.length);

  return PAPER_BEST_CIRCLES[randomIndex];
}
