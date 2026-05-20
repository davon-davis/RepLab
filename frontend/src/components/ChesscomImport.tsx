import { useCallback, useEffect, useState } from 'react'
import { parsePgn, type ParsedGame } from '../utils/chess'
import {
  verifyProfile,
  getArchives,
  getGames,
  archiveToLabel,
  archiveToYearMonth,
  type ChesscomProfile,
  type ChesscomGameSummary,
} from '../api/chesscom'
import {
  getSavedChesscomUsername,
  saveChesscomUsername,
} from '../lib/chesscomStorage'

interface ChesscomImportProps {
  onGameLoaded: (game: ParsedGame) => void
}

type TimeClass = 'all' | 'bullet' | 'blitz' | 'rapid' | 'daily'

const RESULT_COLOR: Record<ChesscomGameSummary['result'], string> = {
  win: 'text-replab-good',
  loss: 'text-replab-blunder',
  draw: 'text-gray-400',
}
const RESULT_LABEL: Record<ChesscomGameSummary['result'], string> = {
  win: 'W',
  loss: 'L',
  draw: 'D',
}

export function ChesscomImport({ onGameLoaded }: ChesscomImportProps) {
  const [username, setUsername] = useState(() => getSavedChesscomUsername())
  const [profile, setProfile] = useState<ChesscomProfile | null>(null)
  const [archives, setArchives] = useState<string[]>([])
  const [selectedArchive, setSelectedArchive] = useState('')
  const [timeClass, setTimeClass] = useState<TimeClass>('all')
  const [games, setGames] = useState<ChesscomGameSummary[]>([])
  const [verifying, setVerifying] = useState(false)
  const [gamesLoading, setGamesLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingGame, setLoadingGame] = useState<string | null>(null)
  const [restored, setRestored] = useState(false)

  async function loadGamesForArchive(uname: string, archiveUrl: string) {
    setGamesLoading(true)
    setError('')
    try {
      const { year, month } = archiveToYearMonth(archiveUrl)
      const fetched = await getGames(uname, year, month)
      setGames([...fetched].reverse())
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load games')
    } finally {
      setGamesLoading(false)
    }
  }

  const verifyUser = useCallback(async (uname: string) => {
    setVerifying(true)
    setError('')
    setProfile(null)
    setArchives([])
    setGames([])
    try {
      const [prof, arcs] = await Promise.all([
        verifyProfile(uname),
        getArchives(uname),
      ])
      const newest = [...arcs].reverse()
      setProfile(prof)
      setArchives(newest)
      setUsername(prof.username)
      saveChesscomUsername(prof.username)
      if (newest.length > 0) {
        setSelectedArchive(newest[0])
        await loadGamesForArchive(prof.username, newest[0])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'User not found')
    } finally {
      setVerifying(false)
    }
  }, [])

  async function handleVerify() {
    const uname = username.trim()
    if (!uname) return
    await verifyUser(uname)
  }

  useEffect(() => {
    if (restored) return
    setRestored(true)
    const saved = getSavedChesscomUsername().trim()
    if (!saved) return
    void verifyUser(saved)
  }, [restored, verifyUser])

  async function handleArchiveChange(archiveUrl: string) {
    setSelectedArchive(archiveUrl)
    setGames([])
    if (!archiveUrl || !profile) return
    await loadGamesForArchive(profile.username, archiveUrl)
  }

  function handleLoadGame(game: ChesscomGameSummary) {
    setLoadingGame(game.uuid)
    try {
      const parsed = parsePgn(game.pgn)
      onGameLoaded(parsed)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse game')
      setLoadingGame(null)
    }
  }

  const filteredGames = timeClass === 'all'
    ? games
    : games.filter(g => g.timeClass === timeClass)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-5">
      {/* Username input */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleVerify()}
          placeholder="Chess.com username"
          className="min-w-0 flex-1 rounded-lg border border-replab-border bg-replab-surface px-4 py-2.5
                     font-display text-sm text-gray-200 placeholder:text-gray-600
                     focus:border-replab-accent focus:outline-none"
        />
        <button
          onClick={handleVerify}
          disabled={verifying || !username.trim()}
          className="rounded-lg bg-replab-accent px-5 py-2.5 font-display text-sm font-medium text-white
                     transition-colors hover:bg-replab-accent/80 disabled:cursor-not-allowed
                     disabled:bg-replab-surface disabled:text-gray-600 sm:min-w-[80px]"
        >
          {verifying ? '···' : 'Verify'}
        </button>
      </div>

      {error && (
        <p className="text-replab-blunder text-sm font-display">{error}</p>
      )}

      {profile && (
        <>
          {/* Profile badge */}
          <div className="flex items-center gap-3 px-1">
            {profile.avatar && (
              <img
                src={profile.avatar}
                alt=""
                className="w-8 h-8 rounded-full border border-replab-border"
              />
            )}
            <span className="font-display text-sm font-medium text-gray-200">
              {profile.username}
            </span>
            <span className="text-xs text-replab-good font-display">✓ Verified</span>
          </div>

          {/* Month + time class filters */}
          <div className="flex flex-col gap-3">
            <select
              value={selectedArchive}
              onChange={e => handleArchiveChange(e.target.value)}
              className="w-full rounded-lg border border-replab-border bg-replab-surface px-3 py-2
                         font-display text-sm text-gray-200 focus:border-replab-accent focus:outline-none"
            >
              {archives.map(arc => (
                <option key={arc} value={arc}>{archiveToLabel(arc)}</option>
              ))}
            </select>

            <div className="-mx-1 flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {(['all', 'bullet', 'blitz', 'rapid', 'daily'] as TimeClass[]).map(tc => (
                <button
                  key={tc}
                  onClick={() => setTimeClass(tc)}
                  className={`shrink-0 rounded-lg px-2.5 py-1.5 font-display text-xs capitalize transition-colors
                    ${timeClass === tc
                      ? 'bg-replab-accent text-white'
                      : 'border border-replab-border text-gray-400 hover:text-gray-200 hover:border-replab-accent/50'
                    }`}
                >
                  {tc}
                </button>
              ))}
            </div>
          </div>

          {/* Game list */}
          {gamesLoading && (
            <p className="text-center text-gray-500 font-display text-sm py-6">Loading games...</p>
          )}

          {!gamesLoading && games.length > 0 && filteredGames.length === 0 && (
            <p className="text-center text-gray-500 font-display text-sm py-6">
              No {timeClass} games this month
            </p>
          )}

          {!gamesLoading && games.length === 0 && selectedArchive && (
            <p className="text-center text-gray-500 font-display text-sm py-6">
              No games found for this month
            </p>
          )}

          {filteredGames.length > 0 && (
            <div className="flex max-h-[min(60vh,320px)] flex-col gap-1 overflow-y-auto pr-1 sm:max-h-80">
              {filteredGames.map(game => (
                <button
                  key={game.uuid}
                  onClick={() => handleLoadGame(game)}
                  disabled={loadingGame === game.uuid}
                  className="group flex items-start gap-2 rounded-lg border border-replab-border bg-replab-surface
                             px-3 py-2.5 text-left transition-all hover:border-replab-accent/50
                             disabled:opacity-50 sm:items-center sm:gap-3"
                >
                  <span className={`w-4 shrink-0 font-display text-sm font-bold ${RESULT_COLOR[game.result]}`}>
                    {RESULT_LABEL[game.result]}
                  </span>

                  <span className={`w-3 shrink-0 font-display text-xs ${
                    game.color === 'white' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {game.color === 'white' ? '○' : '●'}
                  </span>

                  <div className="min-w-0 flex-1">
                    <span className="block truncate font-display text-sm text-gray-200">
                      vs {game.opponentUsername}
                      <span className="ml-1.5 text-xs text-gray-500">({game.opponentRating})</span>
                    </span>
                    <span className="block truncate font-display text-xs capitalize text-gray-500">
                      {game.opening}
                    </span>
                    <span className="mt-0.5 font-display text-xs text-gray-600 sm:hidden">
                      {game.timeClass} · {new Date(game.endTime * 1000).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="hidden shrink-0 flex-col items-end gap-0.5 sm:flex">
                    <span className="font-display text-xs capitalize text-gray-500">{game.timeClass}</span>
                    <span className="font-display text-xs text-gray-600">
                      {new Date(game.endTime * 1000).toLocaleDateString()}
                    </span>
                  </div>

                  <span className="shrink-0 font-display text-xs text-replab-accent sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                    Load →
                  </span>
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
