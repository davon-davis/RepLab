import { useState } from 'react'
import { PgnImport } from './components/PgnImport'
import { ChesscomImport } from './components/ChesscomImport'
import { GameReview } from './pages/GameReview'
import type { ParsedGame } from './utils/chess'
import { OpeningCatalog } from './pages/OpeningCatalog'
import type { Opening } from './utils/chess/openings'
import { OpeningDrill } from './pages/OpeningDrill'
type View = 'import' | 'review' | 'openings' | 'drill'
type ImportMode = 'chesscom' | 'paste'

export default function App() {
  const [view, setView] = useState<View>('import')
  const [importMode, setImportMode] = useState<ImportMode>('chesscom')
  const [game, setGame] = useState<ParsedGame | null>(null)
  const [selectedOpening, setSelectedOpening] = useState<Opening | null>(null)

  function handleGameLoaded(g: ParsedGame) {
    setGame(g)
    setView('review')
  }

  function handleOpeningSelect(o: Opening) {
    setSelectedOpening(o)
    setView('drill')
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
            {(['Game Review', 'Drills', 'Openings', 'Dashboard'] as const).map((label, i) => {
              const active =
                (i === 0 && (view === 'import' || view === 'review')) ||
                (i === 2 && (view === 'openings' || view === 'drill'))
              const enabled = i === 0 || i === 2
              function handleClick() {
                if (i === 0) setView(game ? 'review' : 'import')
                if (i === 2) setView('openings')
              }
              return (
                <button
                  key={label}
                  onClick={handleClick}
                  disabled={!enabled}
                  className={`px-3 py-1.5 text-sm font-display rounded-lg transition-colors
                    ${active
                      ? 'text-gray-200 bg-replab-surface'
                      : enabled
                        ? 'text-gray-400 hover:text-gray-200'
                        : 'text-gray-600 cursor-not-allowed'
                    }`}
                  title={!enabled ? 'Coming soon' : ''}
                >
                  {label}
                  {!enabled && <span className="ml-1 text-xs opacity-40">soon</span>}
                </button>
              )
            })}
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

{view === 'openings' && (
          <OpeningCatalog onSelect={handleOpeningSelect} />
        )}

        {view === 'drill' && selectedOpening && (
          <OpeningDrill
            opening={selectedOpening}
            onBack={() => setView('openings')}
          />
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
