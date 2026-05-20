import { NavLink } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-1.5 font-display text-sm transition-colors ${
    isActive
      ? 'bg-replab-surface text-gray-200'
      : 'text-gray-400 hover:text-gray-200'
  }`

export function Header() {
  const { game } = useGame()

  return (
    <header className="border-b border-replab-border">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="font-display text-xl font-medium tracking-tight text-replab-accent">
            Rep<span className="text-gray-200">Lab</span>
          </span>
          <span className="rounded-full border border-replab-border px-2 py-0.5 font-display text-xs text-gray-600">
            MVP
          </span>
        </div>

        <nav className="flex items-center gap-1">
          <NavLink to={game ? '/review' : '/'} className={navLinkClass}>
            Game Review
          </NavLink>

          <NavLink to="/openings" className={navLinkClass}>
            Openings
          </NavLink>

          <button
            disabled
            className="cursor-not-allowed rounded-lg px-3 py-1.5 font-display text-sm text-gray-600"
            title="Coming soon"
          >
            Drills <span className="ml-1 text-xs opacity-40">soon</span>
          </button>

          <button
            disabled
            className="cursor-not-allowed rounded-lg px-3 py-1.5 font-display text-sm text-gray-600"
            title="Coming soon"
          >
            Dashboard <span className="ml-1 text-xs opacity-40">soon</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
