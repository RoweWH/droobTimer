import type {
  Sq1LayerState,
  Sq1Piece,
  Sq1PieceId,
  Sq1State,
} from './squareOneTypes';

const LAYER_SIZE = 12;
const SLICE_SIZE = 6;

function createPiece(id: Sq1PieceId, width: 1 | 2): Sq1Piece {
  return {
    id,
    kind: width === 2 ? 'corner' : 'edge',
    width,
    flipped: false,
  };
}

function expandPieces(pieces: readonly Sq1Piece[]): Sq1LayerState {
  return pieces.flatMap(piece => Array.from({ length: piece.width }, () => piece));
}

export function getSolvedSq1State(): Sq1State {
  /*
   * Solved holding orientation:
   *
   * - yellow on top
   * - white on bottom
   * - red facing the user
   * - the large middle-bar section on the user's right
   *
   * Moving clockwise around the top from the front-left corner gives:
   *
   *   ULF -> UL -> UBL -> UB -> URB -> UR -> UFR -> UF
   *
   * This makes the four top corners appear in the requested order:
   * yellow/red/blue, yellow/blue/orange, yellow/orange/green,
   * yellow/green/red.
   *
   * The bottom uses the matching white-layer order.
   * Corners occupy two 30-degree units and edges occupy one.
   */
  const top = expandPieces([
    createPiece('ulf', 2),
    createPiece('ul', 1),
    createPiece('ubl', 2),
    createPiece('ub', 1),
    createPiece('urb', 2),
    createPiece('ur', 1),
    createPiece('ufr', 2),
    createPiece('uf', 1),
  ]);

  const bottom = expandPieces([
    createPiece('dlf', 2),
    createPiece('dl', 1),
    createPiece('dbl', 2),
    createPiece('db', 1),
    createPiece('drb', 2),
    createPiece('dr', 1),
    createPiece('dfr', 2),
    createPiece('df', 1),
  ]);

  return { top, bottom, equatorFlipped: false };
}

function rotateLayer(layer: Sq1LayerState, amount: number): Sq1LayerState {
  const normalizedAmount = ((amount % LAYER_SIZE) + LAYER_SIZE) % LAYER_SIZE;

  if (normalizedAmount === 0) {
    return [...layer];
  }

  const rotated = new Array<Sq1Piece>(LAYER_SIZE);

  for (let index = 0; index < LAYER_SIZE; index += 1) {
    rotated[(index + normalizedAmount) % LAYER_SIZE] = layer[index];
  }

  return rotated;
}

function hasPieceBoundary(layer: Sq1LayerState, index: number): boolean {
  const before = layer[(index - 1 + LAYER_SIZE) % LAYER_SIZE];
  const after = layer[index % LAYER_SIZE];

  return before !== after;
}

function assertSliceable(state: Sq1State): void {
  const boundaries = [0, SLICE_SIZE];

  for (const boundary of boundaries) {
    if (!hasPieceBoundary(state.top, boundary) || !hasPieceBoundary(state.bottom, boundary)) {
      throw new Error('The Square-1 scramble attempts a slice through a piece.');
    }
  }
}

function applySlice(state: Sq1State): Sq1State {
  assertSliceable(state);

  const topHalf = state.top.slice(0, SLICE_SIZE).reverse();
  const bottomHalf = state.bottom.slice(0, SLICE_SIZE).reverse();

  const movedPieces = new Set<Sq1Piece>([...topHalf, ...bottomHalf]);

  for (const piece of movedPieces) {
    piece.flipped = !piece.flipped;
  }

  return {
    top: [...bottomHalf, ...state.top.slice(SLICE_SIZE)],
    bottom: [...topHalf, ...state.bottom.slice(SLICE_SIZE)],
    equatorFlipped: !state.equatorFlipped,
  };
}

export function getSq1State(scramble: string): Sq1State {
  let state = getSolvedSq1State();
  const tokenPattern = /\(\s*(-?\d+)\s*,\s*(-?\d+)\s*\)|\//g;
  let previousEnd = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(scramble)) !== null) {
    const skippedText = scramble.slice(previousEnd, match.index);

    if (skippedText.trim().length > 0) {
      throw new Error(`Unsupported Square-1 notation: ${skippedText.trim()}`);
    }

    if (match[0] === '/') {
      state = applySlice(state);
    } else {
      const topAmount = Number(match[1]);
      const bottomAmount = Number(match[2]);

      state = {
        top: rotateLayer(state.top, topAmount),
        bottom: rotateLayer(state.bottom, -bottomAmount),
        equatorFlipped: state.equatorFlipped,
      };
    }

    previousEnd = tokenPattern.lastIndex;
  }

  const trailingText = scramble.slice(previousEnd);

  if (trailingText.trim().length > 0) {
    throw new Error(`Unsupported Square-1 notation: ${trailingText.trim()}`);
  }

  return state;
}
