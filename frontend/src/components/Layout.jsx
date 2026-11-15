import { useAuth } from '../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogOut, FileText, ShieldCheck, LayoutDashboard, Users, Send, UserCircle } from 'lucide-react'
import NotificationBell from './NotificationBell'

const ROLE_LABEL = { EMPLOYEE: 'Officer', AUTHORITY: 'Reporting Authority' }

export default function Layout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const handleLogout = () => { logout(); navigate('/login') }
  const isAuthority = user?.role === 'AUTHORITY'

  const navBtn = (path, label, Icon) => {
    const active = location.pathname === path
    return (
      <button onClick={() => navigate(path)}
        className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded transition-colors ${
          active ? 'bg-white/20' : 'hover:bg-white/10'}`}>
        <Icon size={14} /> {label}
      </button>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="bg-maroon text-white shadow">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <FileText size={26} />
            <div>
              <p className="text-[10px] tracking-widest uppercase text-white/70 font-medium">
                Government of India · NIC Tripura
              </p>
              <h1 className="text-base font-bold leading-tight">APAR / ACR Management System</h1>
            </div>
          </div>
          {user && (
            <div className="flex items-center justify-end gap-2 flex-wrap">
              {navBtn('/', 'Dashboard', LayoutDashboard)}
              {isAuthority && navBtn('/directory', 'Employees', Users)}
              {isAuthority && navBtn('/notify', 'Notify', Send)}
              {!isAuthority && navBtn('/profile', 'My Profile', UserCircle)}
              <NotificationBell />
              <div className="text-right ml-1">
                <p className="text-sm font-semibold">{user.fullName}</p>
                <p className="text-[11px] text-white/70 flex items-center gap-1 justify-end">
                  <ShieldCheck size={12} /> {ROLE_LABEL[user.role] || user.role} · ID {user.employeeId}
                </p>
              </div>
              <button onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs bg-maroon-dark hover:bg-black/30 px-3 py-1.5 rounded transition-colors">
                <LogOut size={14} /> Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-6">{children}</main>
      <footer className="text-center text-xs text-gray-400 py-6">
        National Informatics Centre, Tripura State Unit · Ministry of Electronics &amp; IT
      </footer>
    </div>
  )
}
