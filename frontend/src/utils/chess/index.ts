import { Chess } from 'chess.js'

export interface MoveData {
  san: string
  fen: string
  moveNumber: number
  color: 'w' | 'b'
  from: string
  to: string
}

export interface ParsedGame {
  moves: MoveData[]
  headers: Record<string, string>
  startFen: string
}

export function parsePgn(pgn: string): ParsedGame {
  const chess = new Chess()

  try {
    chess.loadPgn(pgn)
  } catch (e) {
    throw new Error('Invalid PGN: ' + (e instanceof Error ? e.message : String(e)))
  }

  const headers: Record<string, string> = {}
  const headerLines = pgn.match(/\[(\w+)\s+"([^"]*)"\]/g) || []
  for (const line of headerLines) {
    const match = line.match(/\[(\w+)\s+"([^"]*)"\]/)
    if (match) headers[match[1]] = match[2]
  }

  // Replay from start to capture all positions
  const history = chess.history({ verbose: true })
  const replay = new Chess()
  const startFen = replay.fen()

  const moves: MoveData[] = []
  for (let i = 0; i < history.length; i++) {
    const h = history[i]
    replay.move(h.san)
    moves.push({
      san: h.san,
      fen: replay.fen(),
      moveNumber: Math.floor(i / 2) + 1,
      color: h.color,
      from: h.from,
      to: h.to,
    })
  }

  return { moves, headers, startFen }
}

export function formatGameTitle(headers: Record<string, string>): string {
  const white = headers['White'] || 'White'
  const black = headers['Black'] || 'Black'
  const date = headers['Date']?.replace(/\.\?\?/g, '') || ''
  return `${white} vs ${black}${date ? ' · ' + date : ''}`
}

export function getOpeningName(headers: Record<string, string>): string {
  return headers['Opening'] || headers['ECO'] || 'Unknown Opening'
}
