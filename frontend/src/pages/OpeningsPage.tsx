import { useNavigate } from 'react-router-dom'
import { OpeningCatalog } from './OpeningCatalog'

export function OpeningsPage() {
  const navigate = useNavigate()

  return (
    <OpeningCatalog onSelect={(o) => navigate(`/openings/${o.id}`)} />
  )
}
