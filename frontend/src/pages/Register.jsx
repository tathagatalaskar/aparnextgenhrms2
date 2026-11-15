import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { authApi, metaApi } from '../api/api'
import { FileText, UserPlus, AlertCircle, CheckCircle } from 'lucide-react'

export default function Register() {
  const navigate = useNavigate()
  const [depts, setDepts] = useState([])
  const [departmentsError, setDepartmentsError] = useState('')
  const [form, setForm] = useState({
    empIniName: 'Shri', empFirstName: '', empMidName: '', empLastName: '',
    gender: 'M', dateOfBirth: '', departmentId: '', designation: '',
    mobileNumber: '', email: '', password: '',
  })
  const [error, setError] = useState('')
  const [ok, setOk] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    let active = true
    metaApi.departments()
      .then(({ data }) => { if (active) setDepts(Array.isArray(data) ? data : []) })
      .catch((e) => {
        if (active) setDepartmentsError(e.response?.data?.error || 'Unable to load departments. Check the API connection and refresh this page.')
      })
    return () => { active = false }
  }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setOk('')
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (!form.departmentId) { setError('Please select a department.'); return }
    setBusy(true)
    try {
      await authApi.register({
        ...form,
        departmentId: Number(form.departmentId),
        empMidName: form.empMidName || null,
        designation: form.designation || null,
        mobileNumber: form.mobileNumber || null,
      })
      setOk('Registration submitted and awaiting authority approval. You can sign in after activation. Redirecting to login…')
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      const data = err.response?.data
      setError(data?.error || Object.values(data?.fields || {})[0] || 'Registration failed')
    } finally { setBusy(false) }
  }

  const input = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon/30'
  const lbl = 'block text-xs font-semibold uppercase text-gray-600 mb-1'

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        <div className="bg-maroon text-white rounded-t-lg px-8 py-6 flex items-center gap-3">
          <FileText size={30} />
          <div>
            <p className="text-[10px] tracking-widest uppercase text-white/70">Government of India · NIC Tripura</p>
            <h1 className="text-lg font-bold">New Employee Registration</h1>
          </div>
        </div>
        <form onSubmit={submit} className="bg-white shadow-md rounded-b-lg px-8 py-6">
          {departmentsError && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">
              <AlertCircle size={16} /> {departmentsError}
            </div>
          )}
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          {ok && (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2 mb-4">
              <CheckCircle size={16} /> {ok}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={lbl}>Title</label>
              <select className={input} value={form.empIniName} onChange={(e) => set('empIniName', e.target.value)}>
                <option>Shri</option><option>Smt</option><option>Kum</option><option>Dr</option>
              </select>
            </div>
            <div>
              <label className={lbl}>First Name *</label>
              <input className={input} value={form.empFirstName} onChange={(e) => set('empFirstName', e.target.value)} required />
            </div>
            <div>
              <label className={lbl}>Middle Name</label>
              <input className={input} value={form.empMidName} onChange={(e) => set('empMidName', e.target.value)} />
            </div>
            <div>
              <label className={lbl}>Last Name *</label>
              <input className={input} value={form.empLastName} onChange={(e) => set('empLastName', e.target.value)} required />
            </div>
            <div>
              <label className={lbl}>Gender *</label>
              <select className={input} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                <option value="M">Male</option><option value="F">Female</option>
              </select>
            </div>
            <div>
              <label className={lbl}>Date of Birth *</label>
              <input type="date" className={input} value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} required />
            </div>
            <div>
              <label className={lbl}>Department *</label>
              <select className={input} value={form.departmentId} onChange={(e) => set('departmentId', e.target.value)} required>
                <option value="">— Select —</option>
                {depts.map((d) => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
              </select>
            </div>
            <div>
              <label className={lbl}>Designation</label>
              <input className={input} value={form.designation} onChange={(e) => set('designation', e.target.value)} placeholder="e.g. Scientist-B" />
            </div>
            <div>
              <label className={lbl}>Mobile (10 digits)</label>
              <input className={input} value={form.mobileNumber} onChange={(e) => set('mobileNumber', e.target.value)} placeholder="9436xxxxxx" />
            </div>
            <div>
              <label className={lbl}>NIC Email *</label>
              <input type="email" className={input} value={form.email} onChange={(e) => set('email', e.target.value)} required />
            </div>
            <div className="md:col-span-2">
              <label className={lbl}>Password * (min 8 chars)</label>
              <input type="password" className={input} value={form.password} onChange={(e) => set('password', e.target.value)} required />
            </div>
          </div>

          <button type="submit" disabled={busy || departmentsError !== '' || depts.length === 0}
            className="mt-5 w-full flex items-center justify-center gap-2 bg-maroon hover:bg-maroon-dark text-white font-semibold py-2.5 rounded transition-colors disabled:opacity-60">
            <UserPlus size={16} /> {busy ? 'Creating account…' : 'Register'}
          </button>
          <p className="text-center text-xs text-gray-500 mt-3">
            Already have an account? <Link to="/login" className="text-maroon font-semibold">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
