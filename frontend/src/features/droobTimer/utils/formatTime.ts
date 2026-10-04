export function formatTime(milliseconds: number | null, showCentiseconds = true): string {
  if (milliseconds === null) {
    return 'DNF';
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    const time = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;

    if (!showCentiseconds) {
      return time;
    }

    const centiseconds = Math.floor((milliseconds % 1000) / 10);

    return `${time}.${centiseconds.toString().padStart(2, '0')}`;
  }

  const centiseconds = Math.floor((milliseconds % 1000) / 10);

  if (minutes > 0) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds
      .toString()
      .padStart(2, '0')}`;
  }

  return `${seconds}.${centiseconds.toString().padStart(2, '0')}`;
}
