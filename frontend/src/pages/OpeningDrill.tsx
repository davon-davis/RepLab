import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { useBoardWidth } from '../hooks/useBoardWidth'
import { Chess, type Square as ChessSquare } from 'chess.js'
import { Chessboard } from 'react-chessboard'
import type { Opening } from '../utils/chess/openings'
import { buildMoveHintStyles, isPlayersPiece } from '../utils/chess/moveHints'
import {
  buildLocalOpeningHint,
  buildLocalMoveFeedback,
} from '../utils/chess/openingHint'
import { useOpeningExplanation } from '../hooks/useOpeningExplanation'

interface OpeningDrillProps {
  opening: Opening
  onBack: () => void
}

type DrillState = 'waiting' | 'correct' | 'wrong' | 'opponent' | 'complete'

export function OpeningDrill({ opening, onBack }: OpeningDrillProps) {
  const boardContainerRef = useRef<HTMLDivElement>(null)
  const boardWidth = useBoardWidth(boardContainerRef, 480, 0)
  const line = opening.lines[0] // start with first line
  const playingAs = opening.color
  const isPlayerMove = useCallback((idx: number) => line.playerMoves.includes(idx), [line])

  const [chess] = useState(() => new Chess())
  const [fen, setFen] = useState(chess.fen())
  const [moveIndex, setMoveIndex] = useState(0)        // which move in the line we're at
  const [drillState, setDrillState] = useState<DrillState>('waiting')
  const [wrongSquares, setWrongSquares] = useState<Record<string, object>>({})
  const [hintRequested, setHintRequested] = useState(false)
  const [completedMoves, setCompletedMoves] = useState(0)
  const [shake, setShake] = useState(false)
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null)

  const { explanation, show: showExplanation, clear } = useOpeningExplanation()

  const clearSelection = useCallback(() => setSelectedSquare(null), [])

  const opponentTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Play opponent moves automatically
  const playOpponentMove = useCallback((atIndex: number) => {
    if (atIndex >= line.moves.length) return
    if (!line.opponentMoves.includes(atIndex)) return

    setDrillState('opponent')
    opponentTimerRef.current = setTimeout(() => {
      chess.move(line.moves[atIndex])
      setFen(chess.fen())
      setMoveIndex(atIndex + 1)
      setDrillState('waiting')
      setHintRequested(false)
      clearSelection()
      clear()
    }, 600)
  }, [chess, line, clear, clearSelection])

  // Init: if black, opponent goes first
  useEffect(() => {
    chess.reset()
    setFen(chess.fen())
    setMoveIndex(0)
    setDrillState('waiting')
    setCompletedMoves(0)
    clearSelection()
    clear()

    if (playingAs === 'black' && line.opponentMoves.includes(0)) {
      playOpponentMove(0)
    }
  }, [opening.id, line.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function tryPlayerMove(from: string, to: string): boolean {
    const expectedSan = line.moves[moveIndex]
    const fenBefore = chess.fen()
    const move = chess.move({ from, to, promotion: 'q' })
    if (!move) return false

    if (move.san === expectedSan || moveMatchesSan(move, expectedSan, chess)) {
      setFen(chess.fen())
      setDrillState('correct')
      setCompletedMoves((c) => c + 1)
      setWrongSquares({})
      clearSelection()

      showExplanation(
        buildLocalMoveFeedback(fenBefore, move.san, opening.name),
      )

      const nextIdx = moveIndex + 1
      if (nextIdx >= line.moves.length) {
        setDrillState('complete')
      } else {
        setMoveIndex(nextIdx)
        setTimeout(() => {
          setDrillState('opponent')
          playOpponentMove(nextIdx)
        }, 800)
      }
      return true
    }

    chess.undo()
    clearSelection()
    setShake(true)
    setTimeout(() => setShake(false), 500)
    setDrillState('wrong')
    setTimeout(() => setDrillState('waiting'), 1200)
    return false
  }

  function handlePieceDrop(from: string, to: string): boolean {
    if (drillState !== 'waiting') return false
    if (!isPlayerMove(moveIndex)) return false
    clearSelection()
    return tryPlayerMove(from, to)
  }

  function handleSquareClick(square: string, piece: string | undefined) {
    if (drillState !== 'waiting' || !isPlayerMove(moveIndex)) return

    if (selectedSquare === square) {
      clearSelection()
      return
    }

    // Click any of your pieces — switch selection and show that piece's move hints
    if (isPlayersPiece(piece, playingAs)) {
      const moves = chess.moves({ square: square as ChessSquare, verbose: true })
      if (moves.length > 0) setSelectedSquare(square)
      else clearSelection()
      return
    }

    if (selectedSquare) {
      const legalTargets = chess.moves({
        square: selectedSquare as ChessSquare,
        verbose: true,
      })
      if (legalTargets.some((m) => m.to === square)) {
        tryPlayerMove(selectedSquare, square)
      } else {
        clearSelection()
      }
      return
    }

    clearSelection()
  }

  function handleHint() {
    if (!isPlayerMove(moveIndex)) return

    setHintRequested(true)
    const expectedSan = line.moves[moveIndex]
    showExplanation(buildLocalOpeningHint(chess.fen(), expectedSan))
  }

  function handleReset() {
    if (opponentTimerRef.current) clearTimeout(opponentTimerRef.current)
    chess.reset()
    setFen(chess.fen())
    setMoveIndex(0)
    setDrillState('waiting')
    setCompletedMoves(0)
    setHintRequested(false)
    setWrongSquares({})
    clearSelection()
    clear()

    if (playingAs === 'black' && line.opponentMoves.includes(0)) {
      playOpponentMove(0)
    }
  }

  const moveHintStyles = useMemo(() => {
    if (
      drillState !== 'waiting' ||
      !isPlayerMove(moveIndex) ||
      !selectedSquare
    ) {
      return {}
    }
    return buildMoveHintStyles(
      chess.moves({ square: selectedSquare as ChessSquare, verbose: true }),
      selectedSquare,
    )
  }, [chess, fen, drillState, moveIndex, selectedSquare, isPlayerMove])

  const totalPlayerMoves = line.playerMoves.length
  const progress = Math.round((completedMoves / totalPlayerMoves) * 100)
  const boardOrientation = playingAs

  // Highlight last move
  const lastMoveHighlight: Record<string, object> = {}
  if (moveIndex > 0) {
    try {
      const tmpChess = new Chess()
      for (let i = 0; i < moveIndex - 1; i++) tmpChess.move(line.moves[i])
      const lastMove = tmpChess.move(line.moves[moveIndex - 1])
      if (lastMove) {
        lastMoveHighlight[lastMove.from] = { background: 'rgba(124,107,234,0.25)' }
        lastMoveHighlight[lastMove.to]   = { background: 'rgba(124,107,234,0.45)' }
      }
    } catch {}
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 lg:flex-row">
      {/* Board column */}
      <div className="flex w-full shrink-0 flex-col gap-3 lg:max-w-[480px]">
        {/* Opponent label */}
        <div className="flex items-center gap-2 px-1">
          <div className={`w-3.5 h-3.5 rounded-sm ${playingAs === 'white' ? 'bg-gray-800 border border-gray-600' : 'bg-[#eeeed2] border border-gray-400'}`} />
          <span className="text-sm font-display text-gray-400">
            {playingAs === 'white' ? 'Black' : 'White'} (theory)
          </span>
        </div>

        {/* Board */}
        <div
          ref={boardContainerRef}
          className={`mx-auto w-full max-w-[480px] overflow-hidden rounded-xl border transition-all duration-150 lg:mx-0
          ${shake ? 'border-replab-blunder' : 'border-replab-border'}
          ${drillState === 'correct' ? 'border-replab-good/60' : ''}
        `}
        >
          <Chessboard
            position={fen}
            boardOrientation={boardOrientation}
            onPieceDrop={handlePieceDrop}
            onSquareClick={handleSquareClick}
            customSquareStyles={{
              ...lastMoveHighlight,
              ...wrongSquares,
              ...moveHintStyles,
            }}
            customDarkSquareStyle={{ backgroundColor: '#769656' }}
            customLightSquareStyle={{ backgroundColor: '#eeeed2' }}
            arePiecesDraggable={drillState === 'waiting'}
            boardWidth={boardWidth}
          />
        </div>

        {/* Player label */}
        <div className="flex items-center gap-2 px-1">
          <div className={`w-3.5 h-3.5 rounded-sm ${playingAs === 'white' ? 'bg-[#eeeed2] border border-gray-400' : 'bg-gray-800 border border-gray-600'}`} />
          <span className="text-sm font-display text-gray-200 font-medium">
            You ({playingAs})
          </span>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleHint}
            disabled={drillState !== 'waiting' || !isPlayerMove(moveIndex)}
            className="min-w-[calc(50%-0.25rem)] flex-1 rounded-lg border border-replab-accent/40 px-4 py-2.5 font-display text-sm text-replab-accent transition-all hover:border-replab-accent hover:bg-replab-accent/10 disabled:cursor-not-allowed disabled:opacity-40 sm:min-w-0"
          >
            💡 Hint
          </button>
          <button
            onClick={handleReset}
            className="min-w-[calc(50%-0.25rem)] flex-1 rounded-lg border border-replab-border px-4 py-2.5 font-display text-sm text-gray-400 transition-colors hover:border-replab-accent/50 hover:text-gray-200 sm:min-w-0 sm:flex-none"
          >
            ↺ Restart
          </button>
          <button
            onClick={onBack}
            className="w-full rounded-lg border border-replab-border px-4 py-2.5 font-display text-sm text-gray-400 transition-colors hover:border-replab-accent/50 hover:text-gray-200 sm:w-auto sm:flex-none"
          >
            ← Back
          </button>
        </div>
      </div>

      {/* Info column */}
      <div className="flex flex-col gap-4 flex-1 min-w-0">
        {/* Opening header */}
        <div className="rounded-xl border border-replab-border bg-replab-surface p-4 sm:p-5">
          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs text-gray-500 font-display mb-1">{opening.eco} · Playing as {playingAs}</p>
              <h2 className="font-display text-lg font-medium text-gray-100 sm:text-xl">{opening.name}</h2>
            </div>
            <span className={`text-xs font-display px-2 py-1 rounded-full border
              ${{ beginner: 'text-replab-good border-replab-good/30',
                  intermediate: 'text-replab-mistake border-replab-mistake/30',
                  advanced: 'text-replab-blunder border-replab-blunder/30' }[opening.difficulty]}`}>
              {opening.difficulty}
            </span>
          </div>
          <p className="text-sm text-gray-500 font-display">{opening.description}</p>

          {/* Progress bar */}
          <div className="mt-4">
            <div className="flex justify-between text-xs text-gray-600 font-display mb-1.5">
              <span>Progress</span>
              <span>{completedMoves}/{totalPlayerMoves} moves</span>
            </div>
            <div className="h-1.5 bg-replab-border rounded-full overflow-hidden">
              <div
                className="h-full bg-replab-accent rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Status / explanation box */}
        <div className={`rounded-xl border p-5 min-h-[140px] transition-all duration-300
          ${drillState === 'complete' ? 'border-replab-good/40 bg-replab-good/5'
          : drillState === 'wrong'    ? 'border-replab-blunder/40 bg-replab-blunder/5'
          : hintRequested             ? 'border-replab-accent/40 bg-replab-accent/5'
          : 'border-replab-border bg-replab-surface'
          }`}
        >
          {drillState === 'complete' ? (
            <CompleteState opening={opening} onRestart={handleReset} onBack={onBack} />
          ) : drillState === 'wrong' ? (
            <WrongState />
          ) : drillState === 'opponent' ? (
            <OpponentState />
          ) : explanation ? (
            <ExplanationState text={explanation} isHint={hintRequested} />
          ) : (
            <IdleState
              moveIndex={moveIndex}
              isPlayerMove={isPlayerMove(moveIndex)}
              playingAs={playingAs}
            />
          )}
        </div>

        {/* Move list breadcrumb */}
        <div className="bg-replab-surface border border-replab-border rounded-xl p-4">
          <p className="text-xs text-gray-600 font-display uppercase tracking-wider mb-3">Line so far</p>
          <div className="flex flex-wrap gap-1">
            {line.moves.slice(0, moveIndex).map((san, i) => (
              <span key={i} className={`text-xs font-display px-2 py-0.5 rounded
                ${line.playerMoves.includes(i)
                  ? 'bg-replab-accent/20 text-replab-accent'
                  : 'bg-replab-border text-gray-500'
                }`}>
                {i % 2 === 0 ? `${Math.floor(i/2)+1}.` : ''}{san}
              </span>
            ))}
            {moveIndex < line.moves.length && (
              <span className="text-xs font-display px-2 py-0.5 rounded border border-dashed
                               border-replab-accent/40 text-gray-600 animate-pulse">
                ?
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────

function IdleState({ moveIndex, isPlayerMove, playingAs }: {
  moveIndex: number; isPlayerMove: boolean; playingAs: string
}) {
  if (moveIndex === 0) return (
    <div>
      <p className="text-gray-400 font-display text-sm font-medium mb-1">Your turn</p>
      <p className="text-gray-500 font-display text-sm">
        Make your first move as {playingAs}. Use the hint button if you're stuck.
      </p>
    </div>
  )
  return (
    <div>
      <p className="text-gray-400 font-display text-sm font-medium mb-1">
        {isPlayerMove ? 'Your move' : 'Waiting...'}
      </p>
      <p className="text-gray-600 font-display text-sm">
        Find the next move in the {playingAs} repertoire. Click hint if you need help.
      </p>
    </div>
  )
}

function ExplanationState({ text, isHint }: { text: string; isHint: boolean }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-base">{isHint ? '💡' : '✅'}</span>
        <span className="text-xs font-display font-medium text-gray-400 uppercase tracking-wider">
          {isHint ? 'Hint' : 'Nice!'}
        </span>
      </div>
      <p className="text-gray-200 font-display text-sm leading-relaxed">{text}</p>
    </div>
  )
}

function WrongState() {
  return (
    <div>
      <p className="text-replab-blunder font-display text-sm font-medium mb-1">❌ Not quite</p>
      <p className="text-gray-500 font-display text-sm">
        That's not the move in this line. Try again — or use the hint button.
      </p>
    </div>
  )
}

function OpponentState() {
  return (
    <div>
      <p className="text-gray-500 font-display text-sm animate-pulse">Opponent is moving...</p>
    </div>
  )
}

function CompleteState({ opening, onRestart, onBack }: {
  opening: Opening; onRestart: () => void; onBack: () => void
}) {
  return (
    <div>
      <p className="text-replab-good font-display font-medium mb-1">
        🎉 Line complete!
      </p>
      <p className="text-gray-400 font-display text-sm mb-4">
        You've played through the full {opening.name} line. Keep drilling to make it stick.
      </p>
      <div className="flex gap-2">
        <button
          onClick={onRestart}
          className="px-4 py-2 bg-replab-accent hover:bg-replab-accent/80 text-white
                     font-display text-sm rounded-lg transition-colors"
        >
          Drill again
        </button>
        <button
          onClick={onBack}
          className="px-4 py-2 border border-replab-border hover:border-replab-accent/50
                     text-gray-400 hover:text-gray-200 font-display text-sm rounded-lg transition-colors"
        >
          Choose another
        </button>
      </div>
    </div>
  )
}

// Loose SAN matching — handles promotion etc.
function moveMatchesSan(move: { san: string }, expected: string, _chess: Chess): boolean {
  return move.san === expected
}
