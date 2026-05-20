import { useEffect, useState, type RefObject } from 'react'

const EVAL_BAR_WIDTH = 14
const BOARD_GAP = 8

export function useBoardWidth(
  containerRef: RefObject<HTMLElement | null>,
  maxWidth = 480,
  reservedSpace = EVAL_BAR_WIDTH + BOARD_GAP,
): number {
  const [boardWidth, setBoardWidth] = useState(() =>
    Math.min(maxWidth, typeof window !== 'undefined' ? window.innerWidth - 48 : 320),
  )

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const update = () => {
      const total = el.clientWidth
      const next = Math.floor(total - reservedSpace)
      setBoardWidth(Math.min(Math.max(next, 260), maxWidth))
    }

    update()
    const observer = new ResizeObserver(update)
    observer.observe(el)
    window.addEventListener('resize', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [containerRef, maxWidth, reservedSpace])

  return boardWidth
}
