import { useEffect, useRef, useState } from 'react'
import type { ParsedGame } from './chess'
import {
  createEngineLineHandler,
  gameKey,
  parseScoreLine,
  type EvalScore,
} from './engineWorker'

export type { EvalScore }

export type Classification = 'best' | 'inaccuracy' | 'mistake' | 'blunder'

export interface MoveEval {
  classification: Classification
  cpLoss: number
}

export function evalToDisplayCp(score: EvalScore): number {
  if (score.type === 'mate') return score.value > 0 ? 10000 : -10000
  return score.value
}

export function formatEval(score: EvalScore): string {
  if (score.type === 'mate') {
    const n = Math.abs(score.value)
    return score.value > 0 ? `+M${n}` : `-M${n}`
  }
  const p = score.value / 100
  if (p > 0) return `+${p.toFixed(1)}`
  if (p < 0) return p.toFixed(1)
  return '0.0'
}

const MOVETIME_MS = 300

function classifyMove(prev: EvalScore, curr: EvalScore, color: 'w' | 'b'): MoveEval {
  const prevCp = evalToDisplayCp(prev)
  const currCp = evalToDisplayCp(curr)
  const cpLoss = Math.max(0, color === 'w' ? prevCp - currCp : currCp - prevCp)

  let classification: Classification
  if (cpLoss >= 200) classification = 'blunder'
  else if (cpLoss >= 90) classification = 'mistake'
  else if (cpLoss >= 30) classification = 'inaccuracy'
  else classification = 'best'

  return { classification, cpLoss }
}

function emptyEvals(count: number): (EvalScore | null)[] {
  return new Array(count).fill(null)
}

export function useAnalysis(game: ParsedGame | null, focusPositionIndex = 0) {
  const positionCount = game ? game.moves.length + 1 : 0
  const [evals, setEvals] = useState<(EvalScore | null)[]>(() =>
    game ? emptyEvals(positionCount) : [],
  )
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const abortRef = useRef(false)
  const focusRef = useRef(focusPositionIndex)
  focusRef.current = focusPositionIndex

  const key = game ? gameKey(game) : null

  useEffect(() => {
    if (!game || !key) {
      setEvals([])
      setIsAnalyzing(false)
      return
    }

    abortRef.current = false
    const positions = [game.startFen, ...game.moves.map(m => m.fen)]
    const evalsArr = emptyEvals(positions.length)
    setEvals(evalsArr)
    setIsAnalyzing(true)

    const worker = new Worker('/engine/sf-proxy.js')
    let idx = 0
    let currentScore: EvalScore = { type: 'cp', value: 0 }
    let waitingForBestmove = false

    function commitEval(index: number, score: EvalScore) {
      if (abortRef.current) return
      evalsArr[index] = score
      setEvals([...evalsArr])
    }

    function handleLine(raw: string) {
      const line = raw.trim()
      if (!line) return

      const cmd = line.split(/\s/)[0]

      if (cmd === 'uciok') {
        worker.postMessage('isready')
        return
      }
      if (cmd === 'readyok') {
        analyzeNext()
        return
      }
      if (!waitingForBestmove) return

      const parsed = parseScoreLine(line, positions[idx])
      if (parsed) currentScore = parsed

      if (cmd === 'bestmove') {
        waitingForBestmove = false
        commitEval(idx, currentScore)
        if (!abortRef.current) analyzeNext()
      }
    }

    function nextIndexToAnalyze(): number | null {
      const focus = focusRef.current
      if (focus >= 0 && focus < positions.length && evalsArr[focus] === null) return focus
      for (let i = 0; i < positions.length; i++) {
        if (evalsArr[i] === null) return i
      }
      return null
    }

    worker.onmessage = createEngineLineHandler(handleLine)

    function analyzeNext() {
      const next = nextIndexToAnalyze()
      if (abortRef.current || next === null) {
        setIsAnalyzing(false)
        worker.terminate()
        return
      }
      idx = next
      currentScore = { type: 'cp', value: 0 }
      waitingForBestmove = true
      worker.postMessage(`position fen ${positions[idx]}`)
      worker.postMessage(`go movetime ${MOVETIME_MS}`)
    }

    worker.postMessage('uci')

    return () => {
      abortRef.current = true
      try { worker.postMessage('stop') } catch { /* ignore */ }
      worker.terminate()
    }
  }, [key])

  const moveEvals: (MoveEval | null)[] = game
    ? game.moves.map((move, i) => {
        const prev = evals[i]
        const curr = evals[i + 1]
        if (!prev || !curr) return null
        return classifyMove(prev, curr, move.color)
      })
    : []

  const analyzed = evals.filter((e): e is EvalScore => e !== null).length
  const progress = evals.length > 0 ? analyzed / evals.length : 0

  return { evals, moveEvals, progress, isAnalyzing }
}
