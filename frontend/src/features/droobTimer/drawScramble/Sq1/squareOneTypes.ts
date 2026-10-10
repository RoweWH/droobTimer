export type Sq1PieceId =
  | 'ufr'
  | 'urb'
  | 'ubl'
  | 'ulf'
  | 'dfr'
  | 'drb'
  | 'dbl'
  | 'dlf'
  | 'uf'
  | 'ur'
  | 'ub'
  | 'ul'
  | 'df'
  | 'dr'
  | 'db'
  | 'dl';

export type Sq1PieceKind = 'corner' | 'edge';

export type Sq1Piece = {
  id: Sq1PieceId;
  kind: Sq1PieceKind;
  width: 1 | 2;
  flipped: boolean;
};

export type Sq1LayerState = Sq1Piece[];

export type Sq1State = {
  top: Sq1LayerState;
  bottom: Sq1LayerState;
  equatorFlipped: boolean;
};
