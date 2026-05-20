import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { useNavigate } from 'react-router-dom'
import type { ParsedGame } from '../utils/chess'

interface GameContextValue {
  game: ParsedGame | null
  loadGame: (game: ParsedGame) => void
  resetGame: () => void
}

const GameContext = createContext<GameContextValue | null>(null)

export function GameProvider({ children }: { children: ReactNode }) {
  const [game, setGame] = useState<ParsedGame | null>(null)
  const navigate = useNavigate()

  const loadGame = useCallback(
    (g: ParsedGame) => {
      setGame(g)
      navigate('/review')
    },
    [navigate],
  )

  const resetGame = useCallback(() => {
    setGame(null)
    navigate('/')
  }, [navigate])

  return (
    <GameContext.Provider value={{ game, loadGame, resetGame }}>
      {children}
    </GameContext.Provider>
  )
}

export function useGame() {
  const ctx = useContext(GameContext)
  if (!ctx) {
    throw new Error('useGame must be used within GameProvider')
  }
  return ctx
}
