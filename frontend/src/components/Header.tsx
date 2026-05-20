import { NavLink } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `shrink-0 rounded-lg px-2.5 py-1.5 font-display text-xs transition-colors sm:px-3 sm:text-sm ${
    isActive
      ? 'bg-replab-surface text-gray-200'
      : 'text-gray-400 hover:text-gray-200'
  }`

export function Header() {
  const { game } = useGame()

  return (
    <header className="border-b border-replab-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
        <div className="flex items-center gap-3">
          <span className="font-display text-lg font-medium tracking-tight text-replab-accent sm:text-xl">
            Rep<span className="text-gray-200">Lab</span>
          </span>
          <span className="rounded-full border border-replab-border px-2 py-0.5 font-display text-xs text-gray-600">
            MVP
          </span>
        </div>

        <nav className="-mx-1 flex items-center gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:mx-0 sm:overflow-visible sm:pb-0 [&::-webkit-scrollbar]:hidden">
          <NavLink to={game ? '/review' : '/'} className={navLinkClass}>
            <span className="sm:hidden">Review</span>
            <span className="hidden sm:inline">Game Review</span>
          </NavLink>

          <NavLink to="/openings" className={navLinkClass}>
            Openings
          </NavLink>

          <button
            disabled
            className="shrink-0 cursor-not-allowed rounded-lg px-2.5 py-1.5 font-display text-xs text-gray-600 sm:px-3 sm:text-sm"
            title="Coming soon"
          >
            Drills
            <span className="ml-1 hidden text-xs opacity-40 sm:inline">soon</span>
          </button>

          <button
            disabled
            className="shrink-0 cursor-not-allowed rounded-lg px-2.5 py-1.5 font-display text-xs text-gray-600 sm:px-3 sm:text-sm"
            title="Coming soon"
          >
            <span className="sm:hidden">Dash</span>
            <span className="hidden sm:inline">Dashboard</span>
            <span className="ml-1 hidden text-xs opacity-40 sm:inline">soon</span>
          </button>
        </nav>
      </div>
    </header>
  )
}
