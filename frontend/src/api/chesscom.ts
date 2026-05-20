const BASE =
  typeof window !== 'undefined' && window.location.hostname === 'localhost'
    ? 'http://localhost:3001/api/chesscom'
    : '/api/chesscom'

export interface ChesscomProfile {
  username: string
  avatar?: string
  country: string
  joined: number
  last_online: number
}

export interface ChesscomGameSummary {
  uuid: string
  url: string
  pgn: string
  timeClass: 'bullet' | 'blitz' | 'rapid' | 'daily' | string
  timeControl: string
  endTime: number
  color: 'white' | 'black'
  result: 'win' | 'loss' | 'draw'
  userRating: number
  opponentUsername: string
  opponentRating: number
  opening: string
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(body.error || `API error ${res.status}`)
  }
  return res.json()
}

export async function verifyProfile(username: string): Promise<ChesscomProfile> {
  return apiFetch(`/player/${username}`)
}

export async function getArchives(username: string): Promise<string[]> {
  const data = await apiFetch<{ archives: string[] }>(`/player/${username}/archives`)
  return data.archives
}

export async function getGames(
  username: string,
  year: string,
  month: string,
): Promise<ChesscomGameSummary[]> {
  const data = await apiFetch<{ games: ChesscomGameSummary[] }>(
    `/player/${username}/games/${year}/${month}`,
  )
  return data.games
}

export function archiveToLabel(archiveUrl: string): string {
  const parts = archiveUrl.split('/')
  const year = Number(parts[parts.length - 2])
  const month = Number(parts[parts.length - 1])
  return new Date(year, month - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' })
}

export function archiveToYearMonth(archiveUrl: string): { year: string; month: string } {
  const parts = archiveUrl.split('/')
  return { year: parts[parts.length - 2], month: parts[parts.length - 1] }
}
