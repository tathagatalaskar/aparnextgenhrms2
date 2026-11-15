import axios from 'axios'

const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()
const baseURL = configuredBaseUrl || (import.meta.env.DEV ? 'http://localhost:8080/api' : '')

const client = axios.create({
  baseURL,
  timeout: 20000,
})

client.interceptors.request.use((config) => {
  if (!baseURL) {
    throw new Error('API URL is not configured. Set VITE_API_BASE_URL in the deployment environment.')
  }
  const token = localStorage.getItem('apar_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

client.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('apar_token')
      localStorage.removeItem('apar_user')
      if (window.location.pathname !== '/login') window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export default client
