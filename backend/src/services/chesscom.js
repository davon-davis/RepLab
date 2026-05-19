import fetch from 'node-fetch'

const BASE = 'https://api.chess.com/pub'
const HEADERS = { 'User-Agent': 'RepLab Chess Trainer (github.com/replab)' }

async function chesscomFetch(path) {
  const res = await fetch(`${BASE}${path}`, { headers: HEADERS })
  if (!res.ok) {
    const err = new Error(`Chess.com API error: ${res.status}`)
    err.status = res.status
    throw err
  }
  return res.json()
}

export async function getProfile(username) {
  return chesscomFetch(`/player/${username}`)
}

export async function getArchives(username) {
  const data = await chesscomFetch(`/player/${username}/games/archives`)
  return data.archives
}

export async function getGames(username, year, month) {
  const data = await chesscomFetch(`/player/${username}/games/${year}/${month}`)
  return data.games.map(game => summarizeGame(game, username))
}

function summarizeGame(game, username) {
  const userIsWhite = game.white.username.toLowerCase() === username.toLowerCase()
  const userSide = userIsWhite ? game.white : game.black
  const opponentSide = userIsWhite ? game.black : game.white

  let result = 'draw'
  if (userSide.result === 'win') result = 'win'
  else if (['checkmated', 'resigned', 'timeout', 'abandoned', 'lose'].includes(userSide.result)) result = 'loss'

  const headers = extractPgnHeaders(game.pgn || '')
  const ecoUrl = headers['ECOUrl'] || ''
  const opening = ecoUrl
    ? ecoUrl.split('/').pop().replace(/-/g, ' ')
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

function extractPgnHeaders(pgn) {
  const headers = {}
  for (const line of pgn.split('\n')) {
    const match = line.match(/^\[(\w+)\s+"([^"]*)"\]/)
    if (match) headers[match[1]] = match[2]
  }
  return headers
}
