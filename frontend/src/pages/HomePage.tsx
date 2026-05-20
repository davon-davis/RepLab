import { useSearchParams } from 'react-router-dom'
import { PgnImport } from '../components/PgnImport'
import { ChesscomImport } from '../components/ChesscomImport'
import { useGame } from '../contexts/GameContext'

type ImportMode = 'chesscom' | 'paste'

export function HomePage() {
  const { loadGame } = useGame()
  const [searchParams, setSearchParams] = useSearchParams()
  const importMode: ImportMode =
    searchParams.get('import') === 'paste' ? 'paste' : 'chesscom'

  function setImportMode(mode: ImportMode) {
    setSearchParams(mode === 'chesscom' ? {} : { import: 'paste' }, {
      replace: true,
    })
  }

  return (
    <div>
      <div className="mb-6 text-center sm:mb-8">
        <h1 className="mb-2 font-display text-2xl font-medium text-gray-100 sm:text-3xl">
          Load a game
        </h1>
        <p className="px-2 font-display text-sm text-gray-500 sm:text-base">
          Import from Chess.com or paste a PGN to start reviewing
        </p>
      </div>

      <div className="mb-6 flex justify-center sm:mb-8">
        <div className="flex w-full max-w-xs gap-1 rounded-xl border border-replab-border bg-replab-surface p-1 sm:max-w-none sm:w-auto">
          <button
            onClick={() => setImportMode('chesscom')}
            className={`flex-1 rounded-lg px-4 py-2 font-display text-sm transition-colors sm:flex-none sm:px-5 ${
              importMode === 'chesscom'
                ? 'bg-replab-accent text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Chess.com
          </button>
          <button
            onClick={() => setImportMode('paste')}
            className={`flex-1 rounded-lg px-4 py-2 font-display text-sm transition-colors sm:flex-none sm:px-5 ${
              importMode === 'paste'
                ? 'bg-replab-accent text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Paste PGN
          </button>
        </div>
      </div>

      {importMode === 'chesscom' && (
        <ChesscomImport onGameLoaded={loadGame} />
      )}
      {importMode === 'paste' && <PgnImport onGameLoaded={loadGame} />}
    </div>
  )
}
