const CHESSCOM_BASE = 'https://api.chess.com/pub'
const USER_AGENT = 'RepLab Chess Trainer (github.com/replab)'

interface Env {
  ASSETS: Fetcher
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url)

    if (url.pathname.startsWith('/api/chesscom')) {
      return handleChesscom(request, url)
    }

    return env.ASSETS.fetch(request)
  },
}

async function handleChesscom(request: Request, url: URL): Promise<Response> {
  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed' }, 405)
  }

  const path = url.pathname.replace(/^\/api\/chesscom/, '') || '/'

  try {
    const playerMatch = path.match(/^\/player\/([^/]+)$/)
    if (playerMatch) {
      const profile = await chesscomFetch(`/player/${playerMatch[1]}`)
      return json(profile)
    }

    const archivesMatch = path.match(/^\/player\/([^/]+)\/archives$/)
    if (archivesMatch) {
      const data = await chesscomFetch(`/player/${archivesMatch[1]}/games/archives`)
      return json({ archives: data.archives })
    }

    const gamesMatch = path.match(/^\/player\/([^/]+)\/games\/(\d{4})\/(\d{1,2})$/)
    if (gamesMatch) {
      const [, username, year, month] = gamesMatch
      const data = await chesscomFetch(`/player/${username}/games/${year}/${month}`)
      const games = (data.games ?? []).map((game: ChesscomGame) =>
        summarizeGame(game, username),
      )
      return json({ games })
    }

    return json({ error: 'Not found' }, 404)
  } catch (err) {
    const status = err instanceof ChesscomError ? err.status : 500
    const message = err instanceof Error ? err.message : 'Unknown error'
    return json({ error: message }, status)
  }
}

class ChesscomError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.status = status
  }
}

async function chesscomFetch(path: string) {
  const res = await fetch(`${CHESSCOM_BASE}${path}`, {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!res.ok) {
    throw new ChesscomError(`Chess.com API error: ${res.status}`, res.status)
  }
  return res.json()
}

interface ChesscomGame {
  uuid: string
  url: string
  pgn?: string
  time_class: string
  time_control: string
  end_time: number
  white: { username: string; rating: number; result: string }
  black: { username: string; rating: number; result: string }
}

function summarizeGame(game: ChesscomGame, username: string) {
  const userIsWhite = game.white.username.toLowerCase() === username.toLowerCase()
  const userSide = userIsWhite ? game.white : game.black
  const opponentSide = userIsWhite ? game.black : game.white

  let result: 'win' | 'loss' | 'draw' = 'draw'
  if (userSide.result === 'win') result = 'win'
  else if (['checkmated', 'resigned', 'timeout', 'abandoned', 'lose'].includes(userSide.result)) {
    result = 'loss'
  }

  const headers = extractPgnHeaders(game.pgn ?? '')
  const ecoUrl = headers['ECOUrl'] ?? ''
  const opening = ecoUrl
    ? ecoUrl.split('/').pop()!.replace(/-/g, ' ')
    : headers['ECO'] || 'Unknown opening'

  return {
    uuid: game.uuid,
    url: game.url,
    pgn: game.pgn,
    timeClass: game.time_class,
    timeControl: game.time_control,
    endTime: game.end_time,
    color: userIsWhite ? 'white' : 'black',
    result,
    userRating: userSide.rating,
    opponentUsername: opponentSide.username,
    opponentRating: opponentSide.rating,
    opening,
  }
}

function extractPgnHeaders(pgn: string): Record<string, string> {
  const headers: Record<string, string> = {}
  for (const line of pgn.split('\n')) {
    const match = line.match(/^\[(\w+)\s+"([^"]*)"\]/)
    if (match) headers[match[1]] = match[2]
  }
  return headers
}

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
