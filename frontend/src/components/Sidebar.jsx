import { NavLink } from 'react-router-dom'

const links = [
  { to: '/dashboard', label: 'Overview', icon: 'grid' },
  { to: '/tasks', label: 'My tasks', icon: 'check' },
]

function Sidebar() {
  return (
    <aside className="border-b border-[#e5e8e2] bg-white px-4 py-3 md:w-[232px] md:shrink-0 md:border-b-0 md:border-r md:px-5 md:py-8">
      <p className="hidden px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-[#9aa29a] md:block">Workspace</p>
      <nav aria-label="Main navigation" className="flex gap-2 md:flex-col">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${isActive ? 'bg-[#edf4ee] text-[#28623e]' : 'text-[#68716a] hover:bg-[#f5f7f4] hover:text-[#20251f]'}`}
          >
            {icon === 'grid' ? (
              <svg viewBox="0 0 20 20" aria-hidden="true" className="size-[18px] fill-none stroke-current" strokeWidth="1.6">
                <rect x="3" y="3" width="5" height="5" rx="1" /><rect x="12" y="3" width="5" height="5" rx="1" />
                <rect x="3" y="12" width="5" height="5" rx="1" /><rect x="12" y="12" width="5" height="5" rx="1" />
              </svg>
            ) : (
              <svg viewBox="0 0 20 20" aria-hidden="true" className="size-[18px] fill-none stroke-current" strokeWidth="1.7">
                <circle cx="10" cy="10" r="7" /><path d="m6.7 10.2 2.1 2.1 4.6-4.7" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-10 hidden border-t border-[#edf0ec] px-3 pt-5 md:block">
        <p className="text-xs leading-5 text-[#89918a]">Your tasks, gathered in one calm place.</p>
      </div>
    </aside>
  )
}

export default Sidebar