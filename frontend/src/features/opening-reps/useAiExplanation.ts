import { useState, useCallback } from 'react'

interface ExplainMoveParams {
  openingName: string
  playingAs: 'white' | 'black'
  moveSan: string
  moveNumber: number
  previousMoves: string[]
  isHint: boolean
}

const SYSTEM_PROMPT = `You are an enthusiastic chess coach explaining opening moves in the style of ChessReps.com.
Your explanations are:
- Short (2-4 sentences max)
- Conversational and opinionated, not dry
- Focused on the WHY, not just the what
- Occasionally funny or dramatic
- Highlight threats, plans, and ideas

For hints: describe what move to make and briefly why, in plain English (e.g. "Castle kingside — your king needs safety before launching an attack")
For move explanations: explain why this move was the right choice and what plan it supports

Never use chess notation in hints. Always use plain English piece names and direction.
Respond with ONLY the explanation text, no preamble.`

export function useAiExplanation() {
  const [explanation, setExplanation] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const explain = useCallback(async (params: ExplainMoveParams) => {
    setLoading(true)
    setExplanation('')

    const moveList = params.previousMoves.join(' ')
    const prompt = params.isHint
      ? `Opening: ${params.openingName}. Playing as ${params.playingAs}. Moves so far: ${moveList || 'none'}. Give me a hint for what move to play next and why. Plain English only, no notation.`
      : `Opening: ${params.openingName}. Playing as ${params.playingAs}. Moves so far: ${moveList}. I just played ${params.moveSan}. Explain why this was the right move and what plan it supports.`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [{ role: 'user', content: prompt }],
        }),
      })
      const data = await res.json()
      const text = data.content?.[0]?.text ?? ''
      setExplanation(text)
    } catch (e) {
      setExplanation('Great move! Keep developing your pieces and controlling the center.')
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setExplanation('')
    setLoading(false)
  }, [])

  return { explanation, loading, explain, clear }
}
