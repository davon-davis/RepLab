import type { EvalScore } from '../../lib/useAnalysis'
import { formatEval } from '../../lib/useAnalysis'

interface EvalBarProps {
  score: EvalScore | null
  orientation: 'white' | 'black'
  height: number
}

const MAX_CP = 800

export function EvalBar({ score, orientation, height }: EvalBarProps) {
  let whitePct = 50

  if (score) {
    if (score.type === 'mate') {
      whitePct = score.value > 0 ? 99 : 1
    } else {
      const clamped = Math.max(-MAX_CP, Math.min(MAX_CP, score.value))
      whitePct = ((clamped + MAX_CP) / (2 * MAX_CP)) * 100
    }
  }

  const displayWhitePct = orientation === 'white' ? whitePct : 100 - whitePct

  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <div
        className="relative rounded-md overflow-hidden border border-replab-border"
        style={{ width: 14, height }}
      >
        <div className="absolute inset-0 bg-gray-800" />
        <div
          className="absolute bottom-0 left-0 right-0 bg-[#eeeed2] transition-[height] duration-300 ease-in-out"
          style={{ height: `${displayWhitePct}%` }}
        />
      </div>
      <span className="text-[10px] font-display font-medium text-gray-400 tabular-nums">
        {score ? formatEval(score) : '···'}
      </span>
    </div>
  )
}
