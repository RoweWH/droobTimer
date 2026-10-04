export type FormattedScramble =
  | {
      type: 'text';
      value: string;
      fontSize: number;
    }
  | {
      type: 'lines';
      value: string[];
      fontSize: number;
    }
  | {
      type: 'squareOne';
      value: SquareOneToken[];
      fontSize: number;
    };

export type SquareOneToken =
  | {
      type: 'move';
      value: string;
    }
  | {
      type: 'slash';
      value: '/';
    };

export function formatScramble(eventId: string, scramble: string): FormattedScramble {
  if (eventId === 'minx') {
    return {
      type: 'lines',
      value: formatMegaminx(scramble),
      fontSize: 1,
    };
  }

  if (eventId === 'sq1') {
    return {
      type: 'squareOne',
      value: formatSquareOne(scramble),
      fontSize: 1.4,
    };
  }

  if (eventId === '666') {
    return {
      type: 'text',
      value: scramble,
      fontSize: 1.3,
    };
  }

  if (eventId === '777') {
    return {
      type: 'text',
      value: scramble,
      fontSize: 1.2,
    };
  }

  return {
    type: 'text',
    value: scramble,
    fontSize: 1.5,
  };
}

function formatMegaminx(scramble: string): string[] {
  const moves = scramble.trim().split(/\s+/);
  const lines: string[] = [];

  let currentLine: string[] = [];

  for (const move of moves) {
    currentLine.push(move);

    if (move === 'U' || move === "U'") {
      lines.push(currentLine.join(' '));
      currentLine = [];
    }
  }

  if (currentLine.length > 0) {
    lines.push(currentLine.join(' '));
  }

  return lines;
}

function formatSquareOne(scramble: string): SquareOneToken[] {
  const tokens: SquareOneToken[] = [];
  const tokenPattern = /(\(\s*-?\d+\s*,\s*-?\d+\s*\))|\//g;

  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(scramble)) !== null) {
    if (match[0] === '/') {
      tokens.push({
        type: 'slash',
        value: '/',
      });
    } else {
      tokens.push({
        type: 'move',
        value: match[0],
      });
    }
  }

  return tokens;
}
