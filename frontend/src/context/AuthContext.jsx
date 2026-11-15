import { createContext, useContext, useState, useCallback } from 'react'
import { authApi } from '../api/api'

const AuthContext = createContext(null)

function readStoredUser() {
  try {
    const token = localStorage.getItem('apar_token')
    const raw = localStorage.getItem('apar_user')
    if (!token || !raw) throw new Error('No saved session')

    const user = JSON.parse(raw)
    if (!user || typeof user !== 'object' || Array.isArray(user) ||
        !user.role || user.employeeId == null) {
      throw new Error('Invalid saved session')
    }
    return user
  } catch {
    try {
      localStorage.removeItem('apar_token')
      localStorage.removeItem('apar_user')
    } catch {
      // Storage may be unavailable in restricted browser contexts.
    }
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const login = useCallback(async (email, password) => {
    const normalizedEmail = String(email || '').trim().toLowerCase()
    const { data } = await authApi.login(normalizedEmail, password)
    if (!data?.token || !data?.role || data.employeeId == null) {
      throw new Error('The server returned an incomplete login response.')
    }
    localStorage.setItem('apar_token', data.token)
    localStorage.setItem('apar_user', JSON.stringify(data))
    setUser(data)
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('apar_token')
    localStorage.removeItem('apar_user')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
