import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { OPENINGS } from '../utils/chess/openings'
import { OpeningDrill } from './OpeningDrill'

export function OpeningDrillPage() {
  const { openingId } = useParams<{ openingId: string }>()
  const navigate = useNavigate()
  const opening = OPENINGS.find((o) => o.id === openingId)

  if (!opening) {
    return <Navigate to="/openings" replace />
  }

  return (
    <OpeningDrill opening={opening} onBack={() => navigate('/openings')} />
  )
}
