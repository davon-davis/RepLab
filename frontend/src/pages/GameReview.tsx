import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { Chessboard } from 'react-chessboard'
import type { ParsedGame, MoveData } from '../utils/chess'
import { formatGameTitle, getOpeningName } from '../utils/chess'
import { useAnalysis, type MoveEval } from '../hooks/useAnalysis'
import { useLiveEval } from '../hooks/useLiveEval'
import { EvalBar } from '../components/EvalBar'
import { useBoardWidth } from '../hooks/useBoardWidth'

interface GameReviewProps {
  game: ParsedGame
  onReset: () => void
}

const CLASSIFICATION_STYLES: Record<string, { dot: string; symbol: string }> = {
  blunder:    { dot: 'bg-replab-blunder',   symbol: '??' },
  mistake:    { dot: 'bg-replab-mistake',    symbol: '?' },
  inaccuracy: { dot: 'bg-replab-inaccuracy', symbol: '?!' },
  best:       { dot: '',                     symbol: '' },
}

export function GameReview({ game, onReset }: GameReviewProps) {
  const boardContainerRef = useRef<HTMLDivElement>(null)
  const boardWidth = useBoardWidth(boardContainerRef)
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white')
  const positionIndex = currentIndex + 1
  const { evals, moveEvals, progress, isAnalyzing } = useAnalysis(game, positionIndex)

  const totalMoves = game.moves.length

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(-1, Math.min(index, totalMoves - 1)))
  }, [totalMoves])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') goTo(currentIndex + 1)
      if (e.key === 'ArrowLeft')  goTo(currentIndex - 1)
      if (e.key === 'ArrowUp')    goTo(-1)
      if (e.key === 'ArrowDown')  goTo(totalMoves - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentIndex, goTo, totalMoves])

  // Reset to start when a new game is loaded
  useEffect(() => { setCurrentIndex(-1) }, [game])

  const currentFen = currentIndex === -1 ? game.startFen : game.moves[currentIndex].fen
  const cachedEval = evals[positionIndex] ?? null
  const liveEval = useLiveEval(currentFen, cachedEval === null)
  const currentEval = useMemo(
    () => cachedEval ?? liveEval,
    [cachedEval, liveEval],
  )

  function getMoveHighlight() {
    if (currentIndex < 0) return {}
    const move = game.moves[currentIndex]
    return {
      [move.from]: { background: 'rgba(124, 107, 234, 0.4)' },
      [move.to]:   { background: 'rgba(124, 107, 234, 0.6)' },
    }
  }

  const movePairs: { white?: MoveData; black?: MoveData; num: number }[] = []
  for (let i = 0; i < totalMoves; i += 2) {
    movePairs.push({ white: game.moves[i], black: game.moves[i + 1], num: game.moves[i].moveNumber })
  }

  const result      = game.headers['Result']  || '*'
  const whitePlayer = game.headers['White']   || 'White'
  const blackPlayer = game.headers['Black']   || 'Black'
  const whiteElo    = game.headers['WhiteElo']
  const blackElo    = game.headers['BlackElo']

  // Summary counts per player
  const whiteCounts = { blunder: 0, mistake: 0, inaccuracy: 0 }
  const blackCounts = { blunder: 0, mistake: 0, inaccuracy: 0 }
  moveEvals.forEach((me, i) => {
    if (!me || me.classification === 'best') return
    const counts = game.moves[i].color === 'w' ? whiteCounts : blackCounts
    counts[me.classification as keyof typeof whiteCounts]++
  })

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row">
      {/* Board column */}
      <div className="flex w-full shrink-0 flex-col gap-3 lg:w-auto">
        <PlayerTag
          name={boardOrientation === 'white' ? blackPlayer : whitePlayer}
          elo={boardOrientation  === 'white' ? blackElo    : whiteElo}
          color={boardOrientation === 'white' ? 'black' : 'white'}
          result={result}
        />

        <div ref={boardContainerRef} className="mx-auto w-full max-w-[480px] lg:mx-0">
          <div className="flex items-stretch gap-2">
            <EvalBar
              score={currentEval}
              orientation={boardOrientation}
              height={boardWidth}
            />
            <div className="min-w-0 flex-1 overflow-hidden rounded-xl border border-replab-border">
              <Chessboard
                position={currentFen}
                boardOrientation={boardOrientation}
                customSquareStyles={getMoveHighlight()}
                customDarkSquareStyle={{ backgroundColor: '#769656' }}
                customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
                areArrowsAllowed={false}
                arePiecesDraggable={false}
                boardWidth={boardWidth}
              />
            </div>
          </div>
        </div>

        <PlayerTag
          name={boardOrientation === 'white' ? whitePlayer : blackPlayer}
          elo={boardOrientation  === 'white' ? whiteElo    : blackElo}
          color={boardOrientation === 'white' ? 'white' : 'black'}
          result={result}
        />

        {/* Analysis progress bar */}
        {isAnalyzing && (
          <div className="h-0.5 w-full bg-replab-border rounded-full overflow-hidden">
            <div
              className="h-full bg-replab-accent transition-all duration-300"
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center justify-center gap-1 sm:justify-start">
            <NavButton onClick={() => goTo(-1)}             title="Start (↑)">⏮</NavButton>
            <NavButton onClick={() => goTo(currentIndex-1)} title="Previous (←)">◀</NavButton>
            <NavButton onClick={() => goTo(currentIndex+1)} title="Next (→)">▶</NavButton>
            <NavButton onClick={() => goTo(totalMoves-1)}   title="End (↓)">⏭</NavButton>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setBoardOrientation(o => o === 'white' ? 'black' : 'white')}
              className="rounded-lg border border-replab-border px-3 py-1.5 font-display text-xs text-gray-400 transition-colors hover:border-replab-accent/50 hover:text-gray-200"
            >
              ⇅ Flip
            </button>
            <button
              onClick={onReset}
              className="rounded-lg border border-replab-border px-3 py-1.5 font-display text-xs text-gray-400 transition-colors hover:border-replab-accent/50 hover:text-gray-200"
            >
              ← New game
            </button>
          </div>
        </div>

        <div className="text-center font-display text-xs text-gray-500">
          {currentIndex === -1
            ? 'Starting position · use ←→ keys or click moves'
            : `Move ${game.moves[currentIndex].moveNumber}${game.moves[currentIndex].color === 'b' ? '...' : '.'} ${game.moves[currentIndex].san}`
          }
        </div>
      </div>

      {/* Right column: game info + move list */}
      <div className="flex flex-col gap-4 flex-1 min-w-0">
        <div className="bg-replab-surface border border-replab-border rounded-xl p-4">
          <h2 className="font-display font-medium text-sm text-replab-accent mb-1">
            {formatGameTitle(game.headers)}
          </h2>
          <p className="text-xs text-gray-500 font-display">{getOpeningName(game.headers)}</p>
          <div className="mt-3 flex flex-wrap gap-4 sm:gap-6">
            <InfoPill label="Result" value={result} />
            {game.headers['TimeControl'] && (
              <InfoPill label="Time" value={formatTimeControl(game.headers['TimeControl'])} />
            )}
            <InfoPill label="Moves" value={String(Math.ceil(totalMoves / 2))} />
          </div>

          {/* Per-player accuracy summary (once analysis done) */}
          {!isAnalyzing && moveEvals.some(Boolean) && (
            <div className="mt-3 flex flex-wrap gap-4 border-t border-replab-border pt-3 sm:gap-6">
              <AccuracySummary label={whitePlayer} counts={whiteCounts} />
              <AccuracySummary label={blackPlayer} counts={blackCounts} />
            </div>
          )}
          {isAnalyzing && (
            <p className="mt-3 text-[10px] text-gray-600 font-display">
              Analyzing… {Math.round(progress * 100)}%
            </p>
          )}
        </div>

        <div className="bg-replab-surface border border-replab-border rounded-xl p-3 flex-1">
          <p className="text-xs text-gray-500 font-display uppercase tracking-wider mb-3 px-1">
            Move list
          </p>
          <div className="move-list max-h-[min(50vh,420px)] overflow-y-auto pr-1 sm:max-h-[420px]">
            {movePairs.map((pair) => (
              <div key={pair.num} className="flex items-center gap-1 mb-0.5">
                <span className="text-xs text-gray-600 font-display w-7 text-right shrink-0">
                  {pair.num}.
                </span>
                {pair.white && (
                  <MoveChip
                    move={pair.white}
                    index={(pair.num - 1) * 2}
                    currentIndex={currentIndex}
                    moveEval={moveEvals[(pair.num - 1) * 2] ?? null}
                    onClick={goTo}
                  />
                )}
                {pair.black && (
                  <MoveChip
                    move={pair.black}
                    index={(pair.num - 1) * 2 + 1}
                    currentIndex={currentIndex}
                    moveEval={moveEvals[(pair.num - 1) * 2 + 1] ?? null}
                    onClick={goTo}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="hidden text-center font-display text-xs text-gray-600 sm:block">
          ← → navigate · ↑ start · ↓ end
        </p>
      </div>
    </div>
  )
}

function MoveChip({ move, index, currentIndex, moveEval, onClick }: {
  move: MoveData
  index: number
  currentIndex: number
  moveEval: MoveEval | null
  onClick: (i: number) => void
}) {
  const isActive = index === currentIndex
  const cls = moveEval?.classification ?? 'best'
  const { dot, symbol } = CLASSIFICATION_STYLES[cls]

  return (
    <button
      onClick={() => onClick(index)}
      className={`
        flex-1 flex items-center gap-1 text-left px-2 py-1 rounded font-display text-sm transition-all
        ${isActive
          ? 'bg-replab-accent text-white font-medium'
          : 'text-gray-300 hover:bg-replab-border hover:text-white'
        }
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} />
      )}
      <span>{move.san}</span>
      {symbol && (
        <span className={`text-[10px] font-bold shrink-0 ${
          cls === 'blunder'    ? 'text-replab-blunder'
          : cls === 'mistake'  ? 'text-replab-mistake'
          : 'text-replab-inaccuracy'
        } ${isActive ? 'opacity-80' : ''}`}>
          {symbol}
        </span>
      )}
    </button>
  )
}

function NavButton({ onClick, title, children }: {
  onClick: () => void; title: string; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-9 h-9 flex items-center justify-center
                 bg-replab-surface border border-replab-border hover:border-replab-accent/50
                 text-gray-400 hover:text-gray-200 rounded-lg transition-colors text-sm"
    >
      {children}
    </button>
  )
}

function PlayerTag({ name, elo, color, result }: {
  name: string; elo?: string; color: 'white' | 'black'; result: string
}) {
  const won = (color === 'white' && result === '1-0') || (color === 'black' && result === '0-1')
  return (
    <div className="flex items-center gap-3 px-1">
      <div className={`w-4 h-4 rounded-sm border ${color === 'white'
        ? 'bg-[#eeeed2] border-gray-400'
        : 'bg-gray-800 border-gray-600'
      }`} />
      <span className="font-display font-medium text-sm text-gray-200">{name}</span>
      {elo && <span className="text-xs text-gray-500 font-display">({elo})</span>}
      {won && <span className="ml-auto text-xs text-replab-good font-display">✓ Won</span>}
    </div>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-xs text-gray-600 font-display">{label}</span>
      <span className="text-xs text-gray-300 font-display font-medium">{value}</span>
    </div>
  )
}

function AccuracySummary({ label, counts }: {
  label: string
  counts: { blunder: number; mistake: number; inaccuracy: number }
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[10px] text-gray-600 font-display truncate max-w-[120px]">{label}</span>
      <div className="flex gap-2">
        {counts.blunder > 0 && (
          <span className="text-[10px] font-display text-replab-blunder">{counts.blunder}??</span>
        )}
        {counts.mistake > 0 && (
          <span className="text-[10px] font-display text-replab-mistake">{counts.mistake}?</span>
        )}
        {counts.inaccuracy > 0 && (
          <span className="text-[10px] font-display text-replab-inaccuracy">{counts.inaccuracy}?!</span>
        )}
        {counts.blunder + counts.mistake + counts.inaccuracy === 0 && (
          <span className="text-[10px] font-display text-replab-good">Clean</span>
        )}
      </div>
    </div>
  )
}

function formatTimeControl(tc: string): string {
  const match = tc.match(/^(\d+)\+(\d+)$/)
  if (match) return `${match[1]}+${match[2]}`
  if (tc === '-') return 'Unlimited'
  return tc
}
