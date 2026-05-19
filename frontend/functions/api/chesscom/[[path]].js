const CHESS_COM_BASE = 'https://api.chess.com/pub'
const USER_AGENT = 'RepLab Chess Trainer (contact: replab@example.com)'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  })
}

async function chesscomFetch(path) {
  const res = await fetch(`${CHESS_COM_BASE}${path}`, {
    headers: { 'User-Agent': USER_AGENT },
  })
  if (!res.ok) {
    const err = new Error(`Chess.com API error: ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

function summarizeGame(game, username) {
  const userIsWhite = game.white.username.toLowerCase() === username.toLowerCase()
  const userSide = userIsWhite ? game.white : game.black
  const opponentSide = userIsWhite ? game.black : game.white

  let result = 'draw'
  if (userSide.result === 'win') result = 'win'
  else if (['checkmated', 'resigned', 'timeout', 'abandoned', 'lose'].includes(userSide.result)) result = 'loss'

  const pgnHeaders = {}
  for (const line of (game.pgn || '').split('\n')) {
    const match = line.match(/^\[(\w+)\s+"([^"]*)"\]/)
    if (match) pgnHeaders[match[1]] = match[2]
  }
  const ecoUrl = pgnHeaders['ECOUrl'] || ''
  const opening = ecoUrl
    ? ecoUrl.split('/').pop().replace(/-/g, ' ')
    : pgnHeaders['ECO'] || 'Unknown opening'

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

export async function onRequest(context) {
  if (context.request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  const segments = context.params.path || []

  try {
    // GET /player/:username
    if (segments.length === 2 && segments[0] === 'player') {
      const [, username] = segments
      const profile = await chesscomFetch(`/player/${username}`)
      return jsonResponse(profile)
    }

    // GET /player/:username/archives
    if (segments.length === 3 && segments[0] === 'player' && segments[2] === 'archives') {
      const [, username] = segments
      const data = await chesscomFetch(`/player/${username}/games/archives`)
      return jsonResponse({ archives: data.archives })
    }

    // GET /player/:username/games/:year/:month
    if (segments.length === 5 && segments[0] === 'player' && segments[2] === 'games') {
      const [, username, , year, month] = segments
      const data = await chesscomFetch(`/player/${username}/games/${year}/${month}`)
      const games = data.games.map(g => summarizeGame(g, username))
      return jsonResponse({ games })
    }

    return jsonResponse({ error: 'Not found' }, 404)
  } catch (err) {
    return jsonResponse({ error: err.message }, err.status || 500)
  }
}
