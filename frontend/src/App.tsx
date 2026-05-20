import { Routes, Route, Navigate } from 'react-router-dom'
import { GameProvider } from './contexts/GameContext'
import { Layout } from './components/Layout'
import { HomePage } from './pages/HomePage'
import { GameReviewPage } from './pages/GameReviewPage'
import { OpeningsPage } from './pages/OpeningsPage'
import { OpeningDrillPage } from './pages/OpeningDrillPage'

export default function App() {
  return (
    <GameProvider>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/review" element={<GameReviewPage />} />
          <Route path="/openings" element={<OpeningsPage />} />
          <Route path="/openings/:openingId" element={<OpeningDrillPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </GameProvider>
  )
}
