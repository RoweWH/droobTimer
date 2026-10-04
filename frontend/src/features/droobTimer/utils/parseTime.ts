export function parseTime(value: string): number | null {
  const input = value.trim().replace(',', '.');

  if (input === '') {
    return null;
  }

  if (/^\d+$/.test(input)) {
    const centisecondsPart = Number(input.slice(-2));
    const secondsPart = Number(input.slice(-4, -2) || '0');
    const minutesPart = Number(input.slice(-6, -4) || '0');
    const hoursPart = Number(input.slice(0, -6) || '0');

    const centiseconds =
      ((hoursPart * 60 + minutesPart) * 60 + secondsPart) * 100 + centisecondsPart;

    const milliseconds = centiseconds * 10;

    return Number.isSafeInteger(milliseconds) ? milliseconds : null;
  }

  if (!/^\d+(?::\d{1,2}){0,2}(?:\.\d{1,2})?$/.test(input)) {
    return null;
  }

  const [timePart, fraction = ''] = input.split('.');
  const sections = timePart.split(':').map(Number);

  if (sections.some(section => !Number.isSafeInteger(section))) {
    return null;
  }

  let totalSeconds: number;

  if (sections.length === 1) {
    totalSeconds = sections[0];
  } else if (sections.length === 2) {
    totalSeconds = sections[0] * 60 + sections[1];
  } else {
    totalSeconds = sections[0] * 3600 + sections[1] * 60 + sections[2];
  }

  const centiseconds = totalSeconds * 100 + Number(fraction.padEnd(2, '0'));

  const milliseconds = centiseconds * 10;

  return Number.isSafeInteger(milliseconds) ? milliseconds : null;
}
