import { useState, useRef, DragEvent } from 'react'
import { parsePgn, type ParsedGame } from '../utils/chess'

const SAMPLE_PGN = `[Event "Rated Blitz game"]
[Site "Chess.com"]
[Date "2024.03.15"]
[White "GrandmasterBot"]
[Black "YourUsername"]
[Result "0-1"]
[WhiteElo "1850"]
[BlackElo "1720"]
[Opening "Sicilian Defense: Najdorf Variation"]

1. e4 c5 2. Nf3 d6 3. d4 cxd4 4. Nxd4 Nf6 5. Nc3 a6 6. Bg5 e6 7. f4 Be7
8. Qf3 Qc7 9. O-O-O Nbd7 10. g4 b5 11. Bxf6 Nxf6 12. g5 Nd7 13. f5 Ne5
14. Qe2 b4 15. Nd5 exd5 16. exd5 Bb7 17. fxe6 fxe6 18. dxe6 O-O-O
19. Nb3 Nxb3+ 20. axb3 Qxe6 0-1`

interface PgnImportProps {
  onGameLoaded: (game: ParsedGame) => void
}

export function PgnImport({ onGameLoaded }: PgnImportProps) {
  const [pgn, setPgn] = useState('')
  const [error, setError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleLoad(text: string) {
    setError('')
    try {
      const game = parsePgn(text.trim())
      onGameLoaded(game)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to parse PGN')
    }
  }

  function handleFileRead(file: File) {
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      setPgn(text)
      handleLoad(text)
    }
    reader.readAsText(file)
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file?.name.endsWith('.pgn')) handleFileRead(file)
  }

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all
          ${isDragging
            ? 'border-replab-accent bg-replab-accent/10'
            : 'border-replab-border hover:border-replab-accent/50 hover:bg-replab-surface/50'
          }
        `}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".pgn"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileRead(file)
          }}
        />
        <div className="text-4xl mb-3 select-none">♟</div>
        <p className="text-replab-accent font-display font-medium">Drop a .pgn file here</p>
        <p className="text-sm text-gray-500 mt-1">or click to browse</p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-replab-border" />
        <span className="text-xs text-gray-500 font-display">OR PASTE PGN</span>
        <div className="flex-1 h-px bg-replab-border" />
      </div>

      {/* PGN textarea */}
      <div className="flex flex-col gap-2">
        <textarea
          value={pgn}
          onChange={(e) => setPgn(e.target.value)}
          placeholder="[Event &quot;Rated Blitz game&quot;]&#10;[White &quot;YourUsername&quot;]&#10;...&#10;&#10;1. e4 e5 2. Nf3 Nc6 ..."
          rows={8}
          className="w-full bg-replab-surface border border-replab-border rounded-lg p-4
                     font-display text-sm text-gray-300 placeholder:text-gray-600
                     focus:outline-none focus:border-replab-accent resize-none"
        />
        {error && (
          <p className="text-replab-blunder text-sm font-display">{error}</p>
        )}
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => pgn.trim() && handleLoad(pgn)}
          disabled={!pgn.trim()}
          className="flex-1 py-3 px-6 bg-replab-accent hover:bg-replab-accent/80
                     disabled:bg-replab-surface disabled:text-gray-600 disabled:cursor-not-allowed
                     text-white font-display font-medium rounded-lg transition-colors"
        >
          Load Game
        </button>
        <button
          onClick={() => {
            setPgn(SAMPLE_PGN)
            handleLoad(SAMPLE_PGN)
          }}
          className="py-3 px-4 border border-replab-border hover:border-replab-accent/50
                     text-gray-400 hover:text-gray-200 font-display text-sm rounded-lg transition-colors"
        >
          Try sample
        </button>
      </div>
    </div>
  )
}
