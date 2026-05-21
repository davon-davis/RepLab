import { useState, useCallback } from 'react'

export function useOpeningExplanation() {
  const [explanation, setExplanation] = useState('')

  const show = useCallback((text: string) => {
    setExplanation(text)
  }, [])

  const clear = useCallback(() => {
    setExplanation('')
  }, [])

  return { explanation, show, clear }
}
