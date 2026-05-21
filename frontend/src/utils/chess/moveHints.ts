import type { CSSProperties } from 'react'

type MoveLike = { to: string; captured?: string }

/** Chess.com-style dots for legal move targets. */
export function buildMoveHintStyles(
  moves: MoveLike[],
  selectedSquare?: string | null,
): Record<string, CSSProperties> {
  const styles: Record<string, CSSProperties> = {}

  if (selectedSquare) {
    styles[selectedSquare] = {
      background: 'rgba(124, 107, 234, 0.5)',
    }
  }

  for (const move of moves) {
    if (move.captured) {
      styles[move.to] = {
        background:
          'radial-gradient(circle, transparent 55%, rgba(0,0,0,0.18) 55%, rgba(0,0,0,0.18) 68%, transparent 68%)',
      }
    } else {
      styles[move.to] = {
        background:
          'radial-gradient(circle, rgba(0,0,0,0.18) 22%, transparent 22%)',
      }
    }
  }

  return styles
}

export function isPlayersPiece(
  piece: string | undefined,
  playingAs: 'white' | 'black',
): boolean {
  if (!piece) return false
  return piece[0] === (playingAs === 'white' ? 'w' : 'b')
}
