import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import SubmitAcr from './pages/SubmitAcr'
import AcrDetail from './pages/AcrDetail'
import EmployeeDirectory from './pages/EmployeeDirectory'
import Register from './pages/Register'
import Notify from './pages/Notify'
import Profile from './pages/Profile'

function Protected({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" replace />
}

function AuthorityOnly({ children }) {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return user.role === 'AUTHORITY' ? children : <Navigate to="/" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<Protected><Dashboard /></Protected>} />
      <Route path="/submit" element={<Protected><SubmitAcr /></Protected>} />
      <Route path="/acr/:id" element={<Protected><AcrDetail /></Protected>} />
      <Route path="/directory" element={<AuthorityOnly><EmployeeDirectory /></AuthorityOnly>} />
      <Route path="/notify" element={<AuthorityOnly><Notify /></AuthorityOnly>} />
      <Route path="/profile" element={<Protected><Profile /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
