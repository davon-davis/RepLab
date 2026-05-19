import { useState } from 'react'
import { PgnImport } from './features/game-review/PgnImport'
import { ChesscomImport } from './features/game-review/ChesscomImport'
import { GameReview } from './features/game-review/GameReview'
import type { ParsedGame } from './lib/chess'

type View = 'import' | 'review'
type ImportMode = 'chesscom' | 'paste'

export default function App() {
  const [view, setView] = useState<View>('import')
  const [importMode, setImportMode] = useState<ImportMode>('chesscom')
  const [game, setGame] = useState<ParsedGame | null>(null)

  function handleGameLoaded(g: ParsedGame) {
    setGame(g)
    setView('review')
  }

  return (
    <div className="min-h-screen bg-replab-bg text-gray-200">
      {/* Nav */}
      <header className="border-b border-replab-border">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-display text-xl font-medium text-replab-accent tracking-tight">
              Rep<span className="text-gray-200">Lab</span>
            </span>
            <span className="text-xs text-gray-600 font-display border border-replab-border
                           px-2 py-0.5 rounded-full">
              MVP
            </span>
          </div>

          <nav className="flex items-center gap-1">
            {(['Game Review', 'Drills', 'Openings', 'Dashboard'] as const).map((label, i) => (
              <button
                key={label}
                onClick={() => i === 0 && setView(game ? 'review' : 'import')}
                className={`px-3 py-1.5 text-sm font-display rounded-lg transition-colors
                  ${i === 0 && (view === 'import' || view === 'review')
                    ? 'text-gray-200 bg-replab-surface'
                    : i === 0
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-600 cursor-not-allowed'
                  }`}
                title={i > 0 ? 'Coming soon' : ''}
              >
                {label}
                {i > 0 && <span className="ml-1 text-xs opacity-40">soon</span>}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {view === 'import' && (
          <div>
            <div className="text-center mb-8">
              <h1 className="font-display text-3xl font-medium text-gray-100 mb-2">
                Load a game
              </h1>
              <p className="text-gray-500 font-display">
                Import from Chess.com or paste a PGN to start reviewing
              </p>
            </div>

            {/* Tab switcher */}
            <div className="flex justify-center mb-8">
              <div className="flex gap-1 bg-replab-surface border border-replab-border rounded-xl p-1">
                <button
                  onClick={() => setImportMode('chesscom')}
                  className={`px-5 py-2 text-sm font-display rounded-lg transition-colors
                    ${importMode === 'chesscom'
                      ? 'bg-replab-accent text-white'
                      : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                  Chess.com
                </button>
                <button
                  onClick={() => setImportMode('paste')}
                  className={`px-5 py-2 text-sm font-display rounded-lg transition-colors
                    ${importMode === 'paste'
                      ? 'bg-replab-accent text-white'
                      : 'text-gray-400 hover:text-gray-200'
                    }`}
                >
                  Paste PGN
                </button>
              </div>
            </div>

            {importMode === 'chesscom' && (
              <ChesscomImport onGameLoaded={handleGameLoaded} />
            )}
            {importMode === 'paste' && (
              <PgnImport onGameLoaded={handleGameLoaded} />
            )}
          </div>
        )}

        {view === 'review' && game && (
          <GameReview
            game={game}
            onReset={() => setView('import')}
          />
        )}
      </main>
    </div>
  )
}
