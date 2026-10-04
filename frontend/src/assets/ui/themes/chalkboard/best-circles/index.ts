import circle1 from './circle-1.svg';
import circle2 from './circle-2.svg';
import circle3 from './circle-3.svg';
import circle4 from './circle-4.svg';
import circle5 from './circle-5.svg';

const CHALKBOARD_BEST_CIRCLES = [circle1, circle2, circle3, circle4, circle5];

export function getRandomChalkboardBestCircle(): string {
  const randomIndex = Math.floor(Math.random() * CHALKBOARD_BEST_CIRCLES.length);

  return CHALKBOARD_BEST_CIRCLES[randomIndex];
}
