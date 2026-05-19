import { useState } from 'react'
import { OPENINGS, type Opening } from '../utils/chess/openings'

interface OpeningCatalogProps {
  onSelect: (opening: Opening) => void
}

const DIFFICULTY_COLORS = {
  beginner:     { dot: 'bg-replab-good',     label: 'text-replab-good',     text: 'Beginner' },
  intermediate: { dot: 'bg-replab-mistake',  label: 'text-replab-mistake',  text: 'Intermediate' },
  advanced:     { dot: 'bg-replab-blunder',  label: 'text-replab-blunder',  text: 'Advanced' },
}

const COLOR_LABELS = { white: '♔ White', black: '♚ Black' }

export function OpeningCatalog({ onSelect }: OpeningCatalogProps) {
  const [filterColor, setFilterColor] = useState<'all' | 'white' | 'black'>('all')
  const [filterDiff, setFilterDiff]   = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all')

  const filtered = OPENINGS.filter(o =>
    (filterColor === 'all' || o.color === filterColor) &&
    (filterDiff  === 'all' || o.difficulty === filterDiff)
  )

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-medium text-gray-100 mb-2">Openings</h1>
        <p className="text-gray-500 font-display">
          Choose an opening to drill. You'll play moves on the board — the app plays the opponent's responses automatically.
        </p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="flex gap-1">
          {(['all', 'white', 'black'] as const).map(c => (
            <FilterChip key={c} active={filterColor === c} onClick={() => setFilterColor(c)}>
              {c === 'all' ? 'All colors' : COLOR_LABELS[c]}
            </FilterChip>
          ))}
        </div>
        <div className="w-px h-5 bg-replab-border" />
        <div className="flex gap-1">
          {(['all', 'beginner', 'intermediate', 'advanced'] as const).map(d => (
            <FilterChip key={d} active={filterDiff === d} onClick={() => setFilterDiff(d)}>
              {d === 'all' ? 'All levels' : d.charAt(0).toUpperCase() + d.slice(1)}
            </FilterChip>
          ))}
        </div>
        <span className="ml-auto text-xs text-gray-600 font-display">
          {filtered.length} opening{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(opening => (
          <OpeningCard key={opening.id} opening={opening} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

function OpeningCard({ opening, onSelect }: { opening: Opening; onSelect: (o: Opening) => void }) {
  const diff = DIFFICULTY_COLORS[opening.difficulty]
  const totalMoves = opening.lines[0]?.playerMoves.length ?? 0

  return (
    <button
      onClick={() => onSelect(opening)}
      className="text-left bg-replab-surface border border-replab-border hover:border-replab-accent/60
                 rounded-xl p-5 transition-all group hover:bg-replab-surface/80"
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-gray-500 font-display">{opening.eco}</span>
            <span className="text-xs text-gray-600 font-display">·</span>
            <span className="text-xs text-gray-500 font-display">
              {opening.color === 'white' ? '♔' : '♚'} {opening.color.charAt(0).toUpperCase() + opening.color.slice(1)}
            </span>
          </div>
          <h3 className="font-display font-medium text-gray-100 group-hover:text-replab-accent transition-colors">
            {opening.name}
          </h3>
        </div>
        <div className="text-gray-600 group-hover:text-replab-accent transition-colors text-lg">→</div>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-500 font-display leading-relaxed mb-4 line-clamp-2">
        {opening.description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
          <span className={`text-xs font-display ${diff.label}`}>{diff.text}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-600 font-display">{totalMoves} moves to learn</span>
        </div>
      </div>

      {/* Tags */}
      <div className="flex gap-1.5 mt-3 flex-wrap">
        {opening.tags.slice(0, 3).map(tag => (
          <span key={tag} className="text-xs text-gray-600 font-display border border-replab-border
                                     px-2 py-0.5 rounded-full">
            {tag}
          </span>
        ))}
      </div>
    </button>
  )
}

function FilterChip({ active, onClick, children }: {
  active: boolean; onClick: () => void; children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-display transition-colors
        ${active
          ? 'bg-replab-accent text-white'
          : 'border border-replab-border text-gray-400 hover:text-gray-200 hover:border-replab-accent/50'
        }`}
    >
      {children}
    </button>
  )
}
