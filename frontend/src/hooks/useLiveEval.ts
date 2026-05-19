import { useEffect, useState } from 'react'
import type { EvalScore } from '../utils/engineWorker'
import { createEngineLineHandler, parseScoreLine } from '../utils/engineWorker'

const MOVETIME_MS = 200

/** Evaluates a single FEN on demand (e.g. while stepping through a game). */
export function useLiveEval(fen: string | null, enabled: boolean): EvalScore | null {
  const [score, setScore] = useState<EvalScore | null>(null)

  useEffect(() => {
    if (!enabled || !fen) {
      setScore(null)
      return
    }

    const positionFen = fen
    let aborted = false
    let currentScore: EvalScore = { type: 'cp', value: 0 }
    let waitingForBestmove = false
    const worker = new Worker('/engine/sf-proxy.js')

    function handleLine(raw: string) {
      const line = raw.trim()
      if (!line) return

      const cmd = line.split(/\s/)[0]

      if (cmd === 'uciok') {
        worker.postMessage('isready')
        return
      }
      if (cmd === 'readyok') {
        waitingForBestmove = true
        worker.postMessage(`position fen ${positionFen}`)
        worker.postMessage(`go movetime ${MOVETIME_MS}`)
        return
      }
      if (!waitingForBestmove) return

      const parsed = parseScoreLine(line, positionFen)
      if (parsed) currentScore = parsed

      if (cmd === 'bestmove') {
        waitingForBestmove = false
        if (!aborted) setScore(currentScore)
      }
    }

    worker.onmessage = createEngineLineHandler(handleLine)
    worker.postMessage('uci')

    return () => {
      aborted = true
      try { worker.postMessage('stop') } catch { /* ignore */ }
      worker.terminate()
    }
  }, [fen, enabled])

  return score
}
