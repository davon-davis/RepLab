export interface EvalScore {
  type: 'cp' | 'mate'
  value: number // always from white's perspective
}

export function gameKey(game: { startFen: string; moves: { fen: string }[] }): string {
  const last = game.moves.length > 0 ? game.moves[game.moves.length - 1].fen : ''
  return `${game.startFen}|${game.moves.length}|${last}`
}

export function sideToMove(fen: string): 'w' | 'b' {
  return fen.split(' ')[1] as 'w' | 'b'
}

export function normalizeToWhite(type: 'cp' | 'mate', raw: number, stm: 'w' | 'b'): EvalScore {
  return { type, value: stm === 'b' ? -raw : raw }
}

export type EngineLineHandler = (line: string) => void

export function createEngineLineHandler(onLine: EngineLineHandler): (e: MessageEvent) => void {
  return (e: MessageEvent) => {
    const data = e.data
    if (typeof data !== 'string') return
    if (data.includes('\n')) {
      for (const line of data.split('\n')) onLine(line)
    } else {
      onLine(data)
    }
  }
}

export function parseScoreLine(
  line: string,
  fen: string,
): EvalScore | null {
  const m = line.match(/score (cp|mate) (-?\d+)/)
  if (!m || line.includes('upperbound') || line.includes('lowerbound')) return null
  return normalizeToWhite(m[1] as 'cp' | 'mate', parseInt(m[2]), sideToMove(fen))
}
