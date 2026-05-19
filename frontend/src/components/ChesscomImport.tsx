import { useState } from 'react'
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
  const [username, setUsername] = useState('')
  const [profile, setProfile] = useState<ChesscomProfile | null>(null)
  const [archives, setArchives] = useState<string[]>([])
  const [selectedArchive, setSelectedArchive] = useState('')
  const [timeClass, setTimeClass] = useState<TimeClass>('all')
  const [games, setGames] = useState<ChesscomGameSummary[]>([])
  const [verifying, setVerifying] = useState(false)
  const [gamesLoading, setGamesLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingGame, setLoadingGame] = useState<string | null>(null)

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

  async function handleVerify() {
    const uname = username.trim()
    if (!uname) return
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
      if (newest.length > 0) {
        setSelectedArchive(newest[0])
        await loadGamesForArchive(prof.username, newest[0])
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'User not found')
    } finally {
      setVerifying(false)
    }
  }

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
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">
      {/* Username input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleVerify()}
          placeholder="Chess.com username"
          className="flex-1 bg-replab-surface border border-replab-border rounded-lg px-4 py-2.5
                     font-display text-sm text-gray-200 placeholder:text-gray-600
                     focus:outline-none focus:border-replab-accent"
        />
        <button
          onClick={handleVerify}
          disabled={verifying || !username.trim()}
          className="px-5 py-2.5 bg-replab-accent hover:bg-replab-accent/80
                     disabled:bg-replab-surface disabled:text-gray-600 disabled:cursor-not-allowed
                     text-white font-display font-medium text-sm rounded-lg transition-colors min-w-[80px]"
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
          <div className="flex gap-3 flex-wrap">
            <select
              value={selectedArchive}
              onChange={e => handleArchiveChange(e.target.value)}
              className="flex-1 min-w-[160px] bg-replab-surface border border-replab-border rounded-lg
                         px-3 py-2 font-display text-sm text-gray-200
                         focus:outline-none focus:border-replab-accent"
            >
              {archives.map(arc => (
                <option key={arc} value={arc}>{archiveToLabel(arc)}</option>
              ))}
            </select>

            <div className="flex gap-1">
              {(['all', 'bullet', 'blitz', 'rapid', 'daily'] as TimeClass[]).map(tc => (
                <button
                  key={tc}
                  onClick={() => setTimeClass(tc)}
                  className={`px-2.5 py-1.5 text-xs font-display rounded-lg capitalize transition-colors
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
            <div className="flex flex-col gap-1 max-h-80 overflow-y-auto pr-1">
              {filteredGames.map(game => (
                <button
                  key={game.uuid}
                  onClick={() => handleLoadGame(game)}
                  disabled={loadingGame === game.uuid}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-replab-surface
                             border border-replab-border hover:border-replab-accent/50
                             transition-all text-left group disabled:opacity-50"
                >
                  <span className={`text-sm font-display font-bold w-4 shrink-0 ${RESULT_COLOR[game.result]}`}>
                    {RESULT_LABEL[game.result]}
                  </span>

                  <span className={`text-xs font-display w-3 shrink-0 ${
                    game.color === 'white' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {game.color === 'white' ? '○' : '●'}
                  </span>

                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="text-sm font-display text-gray-200 truncate">
                      vs {game.opponentUsername}
                      <span className="text-gray-500 text-xs ml-1.5">({game.opponentRating})</span>
                    </span>
                    <span className="text-xs font-display text-gray-500 truncate capitalize">
                      {game.opening}
                    </span>
                  </div>

                  <div className="flex flex-col items-end shrink-0 gap-0.5">
                    <span className="text-xs font-display text-gray-500 capitalize">{game.timeClass}</span>
                    <span className="text-xs font-display text-gray-600">
                      {new Date(game.endTime * 1000).toLocaleDateString()}
                    </span>
                  </div>

                  <span className="text-xs text-replab-accent opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
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
