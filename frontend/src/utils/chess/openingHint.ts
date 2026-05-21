import { Chess } from 'chess.js'

const PIECE_NAMES: Record<string, string> = {
  p: 'pawn',
  n: 'knight',
  b: 'bishop',
  r: 'rook',
  q: 'queen',
  k: 'king',
}

/** Plain-English hint from the expected move in the current position (no API). */
export function buildLocalOpeningHint(fen: string, expectedSan: string): string {
  const chess = new Chess(fen)
  let move
  try {
    move = chess.move(expectedSan, { strict: false })
  } catch {
    move = null
  }

  if (!move) {
    return `Play ${expectedSan} — that's the next move in this line. Develop naturally and keep your king safe.`
  }

  if (move.san === 'O-O') {
    return 'Castle kingside. Your king needs safety before you open the position further.'
  }
  if (move.san === 'O-O-O') {
    return 'Castle queenside. Get the king safe and connect your rooks when the line calls for it.'
  }

  const piece = PIECE_NAMES[move.piece] ?? 'piece'
  const to = move.to

  if (move.captured) {
    return `Capture on ${to} with your ${piece}. That recapture keeps you in the main line.`
  }
  if (move.san.includes('+')) {
    return `Give check with your ${piece} on ${to}. Follow through on the attack in this line.`
  }
  if (move.piece === 'p' && move.flags.includes('b')) {
    return `Push your pawn to ${to}. You're fighting for space and the center here.`
  }
  if (move.piece === 'n' || move.piece === 'b') {
    return `Develop your ${piece} to ${to}. Piece activity is the idea behind this move.`
  }
  return `Move your ${piece} to ${to}. That's the thematic choice in this opening line.`
}

/** Short confirmation after a correct move in the line. */
export function buildLocalMoveFeedback(
  fenBeforeMove: string,
  moveSan: string,
  openingName: string,
): string {
  const hint = buildLocalOpeningHint(fenBeforeMove, moveSan)
  return `Nice! ${hint} You're on track in the ${openingName}.`
}
