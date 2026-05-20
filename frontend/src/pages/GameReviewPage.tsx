import { Navigate } from 'react-router-dom'
import { GameReview } from './GameReview'
import { useGame } from '../contexts/GameContext'

export function GameReviewPage() {
  const { game, resetGame } = useGame()

  if (!game) {
    return <Navigate to="/" replace />
  }

  return <GameReview game={game} onReset={resetGame} />
}
