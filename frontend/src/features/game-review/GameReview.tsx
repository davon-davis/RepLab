import { useState, useEffect, useCallback } from 'react'
import { Chessboard } from 'react-chessboard'
import type { ParsedGame, MoveData } from '../../lib/chess'
import { formatGameTitle, getOpeningName } from '../../lib/chess'

interface GameReviewProps {
  game: ParsedGame
  onReset: () => void
}

export function GameReview({ game, onReset }: GameReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white')

  const currentFen = currentIndex === -1
    ? game.startFen
    : game.moves[currentIndex].fen

  const totalMoves = game.moves.length

  const goTo = useCallback((index: number) => {
    setCurrentIndex(Math.max(-1, Math.min(index, totalMoves - 1)))
  }, [totalMoves])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') goTo(currentIndex + 1)
      if (e.key === 'ArrowLeft') goTo(currentIndex - 1)
      if (e.key === 'ArrowUp') goTo(-1)
      if (e.key === 'ArrowDown') goTo(totalMoves - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [currentIndex, goTo, totalMoves])

  function getMoveHighlight() {
    if (currentIndex < 0) return {}
    const move = game.moves[currentIndex]
    return {
      [move.from]: { background: 'rgba(124, 107, 234, 0.4)' },
      [move.to]: { background: 'rgba(124, 107, 234, 0.6)' },
    }
  }

  const movePairs: { white?: MoveData; black?: MoveData; num: number }[] = []
  for (let i = 0; i < totalMoves; i += 2) {
    movePairs.push({
      white: game.moves[i],
      black: game.moves[i + 1],
      num: game.moves[i].moveNumber,
    })
  }

  const result = game.headers['Result'] || '*'
  const whitePlayer = game.headers['White'] || 'White'
  const blackPlayer = game.headers['Black'] || 'Black'
  const whiteElo = game.headers['WhiteElo']
  const blackElo = game.headers['BlackElo']

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto">
      <div className="flex flex-col gap-3 lg:w-[480px] shrink-0">
        <PlayerTag
          name={boardOrientation === 'white' ? blackPlayer : whitePlayer}
          elo={boardOrientation === 'white' ? blackElo : whiteElo}
          color={boardOrientation === 'white' ? 'black' : 'white'}
          result={result}
        />

        <div className="rounded-xl overflow-hidden border border-replab-border">
          <Chessboard
            position={currentFen}
            boardOrientation={boardOrientation}
            customSquareStyles={getMoveHighlight()}
            customDarkSquareStyle={{ backgroundColor: '#769656' }}
            customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
            areArrowsAllowed={false}
            arePiecesDraggable={false}
            boardWidth={480}
          />
        </div>

        <PlayerTag
          name={boardOrientation === 'white' ? whitePlayer : blackPlayer}
          elo={boardOrientation === 'white' ? whiteElo : blackElo}
          color={boardOrientation === 'white' ? 'white' : 'black'}
          result={result}
        />

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <NavButton onClick={() => goTo(-1)} title="Start (↑)">⏮</NavButton>
            <NavButton onClick={() => goTo(currentIndex - 1)} title="Previous (←)">◀</NavButton>
            <NavButton onClick={() => goTo(currentIndex + 1)} title="Next (→)">▶</NavButton>
            <NavButton onClick={() => goTo(totalMoves - 1)} title="End (↓)">⏭</NavButton>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setBoardOrientation(o => o === 'white' ? 'black' : 'white')}
              className="px-3 py-1.5 text-xs font-display text-gray-400 hover:text-gray-200
                         border border-replab-border hover:border-replab-accent/50 rounded-lg transition-colors"
            >
              ⇅ Flip
            </button>
            <button
              onClick={onReset}
              className="px-3 py-1.5 text-xs font-display text-gray-400 hover:text-gray-200
                         border border-replab-border hover:border-replab-accent/50 rounded-lg transition-colors"
            >
              ← New game
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-500 font-display text-center">
          {currentIndex === -1
            ? 'Starting position · use ←→ keys or click moves'
            : `Move ${game.moves[currentIndex].moveNumber}${game.moves[currentIndex].color === 'b' ? '...' : '.'} ${game.moves[currentIndex].san}`
          }
        </div>
      </div>

      <div className="flex flex-col gap-4 flex-1 min-w-0">
        <div className="bg-replab-surface border border-replab-border rounded-xl p-4">
          <h2 className="font-display font-medium text-sm text-replab-accent mb-1">
            {formatGameTitle(game.headers)}
          </h2>
          <p className="text-xs text-gray-500 font-display">{getOpeningName(game.headers)}</p>
          <div className="flex gap-6 mt-3">
            <InfoPill label="Result" value={result} />
            {game.headers['TimeControl'] && (
              <InfoPill label="Time" value={formatTimeControl(game.headers['TimeControl'])} />
            )}
            <InfoPill label="Moves" value={String(Math.ceil(totalMoves / 2))} />
          </div>
        </div>

        <div className="bg-replab-surface border border-replab-border rounded-xl p-3 flex-1">
          <p className="text-xs text-gray-500 font-display uppercase tracking-wider mb-3 px-1">
            Move list
          </p>
          <div className="move-list overflow-y-auto max-h-[420px] pr-1">
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
                    onClick={goTo}
                  />
                )}
                {pair.black && (
                  <MoveChip
                    move={pair.black}
                    index={(pair.num - 1) * 2 + 1}
                    currentIndex={currentIndex}
                    onClick={goTo}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <p className="text-xs text-gray-600 font-display text-center">
          ← → navigate · ↑ start · ↓ end
        </p>
      </div>
    </div>
  )
}

function MoveChip({ move, index, currentIndex, onClick }: {
  move: MoveData
  index: number
  currentIndex: number
  onClick: (i: number) => void
}) {
  const isActive = index === currentIndex
  return (
    <button
      onClick={() => onClick(index)}
      className={`
        flex-1 text-left px-2 py-1 rounded font-display text-sm transition-all
        ${isActive
          ? 'bg-replab-accent text-white font-medium'
          : 'text-gray-300 hover:bg-replab-border hover:text-white'
        }
      `}
    >
      {move.san}
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

function formatTimeControl(tc: string): string {
  const match = tc.match(/^(\d+)\+(\d+)$/)
  if (match) return `${match[1]}+${match[2]}`
  if (tc === '-') return 'Unlimited'
  return tc
}
