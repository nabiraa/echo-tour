import { Outlet, NavLink } from 'react-router-dom';

const nav = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/artists', label: 'Artists', icon: '🎤' },
  { to: '/concerts', label: 'Concerts', icon: '🎵' },
  { to: '/venues', label: 'Venues', icon: '🏟️' },
  { to: '/tickets', label: 'Tickets', icon: '🎫' },
  { to: '/staff', label: 'Staff', icon: '👥' },
  { to: '/analytics', label: 'Analytics', icon: '📊' },
];

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0d0d14] border-r border-[#1e1e2e] flex flex-col flex-shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-[#1e1e2e]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#ff6b9d] to-[#9b59d6] flex items-center justify-center text-lg font-bold">E</div>
            <div>
              <div className="text-white font-bold text-sm leading-tight font-sora">ECHO</div>
              <div className="text-gray-500 text-xs">Tour Management</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-[#ff6b9d]/20 to-[#9b59d6]/20 text-white border border-[#9b59d6]/30'
                    : 'text-gray-400 hover:text-white hover:bg-[#1e1e2e]'
                }`
              }
            >
              <span>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1e1e2e]">
          <div className="text-xs text-gray-600">ECHO v1.0 — DBMS Lab</div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
