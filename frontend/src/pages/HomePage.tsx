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
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-display text-3xl font-medium text-gray-100">
          Load a game
        </h1>
        <p className="font-display text-gray-500">
          Import from Chess.com or paste a PGN to start reviewing
        </p>
      </div>

      <div className="mb-8 flex justify-center">
        <div className="flex gap-1 rounded-xl border border-replab-border bg-replab-surface p-1">
          <button
            onClick={() => setImportMode('chesscom')}
            className={`rounded-lg px-5 py-2 font-display text-sm transition-colors ${
              importMode === 'chesscom'
                ? 'bg-replab-accent text-white'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Chess.com
          </button>
          <button
            onClick={() => setImportMode('paste')}
            className={`rounded-lg px-5 py-2 font-display text-sm transition-colors ${
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
