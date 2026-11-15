import { useEffect, useState } from 'react'
import { meApi } from '../api/api'
import Layout from '../components/Layout'
import { User, Save, AlertCircle, CheckCircle } from 'lucide-react'

function fmtDate(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return d }
}

export default function Profile() {
  const [me, setMe] = useState(null)
  const [form, setForm] = useState({ mobileNumber: '', email: '', designation: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    meApi.profile().then(({ data }) => {
      setMe(data)
      setForm({ mobileNumber: data.mobileNumber || '', email: data.email || '', designation: data.designation || '' })
    }).catch((e) => setError(e.response?.data?.error || 'Failed to load profile'))
  }, [])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    setError(''); setNotice(''); setBusy(true)
    try {
      const { data } = await meApi.update(form)
      setMe(data); setNotice('Profile updated.')
    } catch (e) {
      const d = e.response?.data
      setError(d?.error || Object.values(d?.fields || {})[0] || 'Update failed')
    } finally { setBusy(false) }
  }

  if (!me) return <Layout><p className="text-sm text-gray-500">Loading…</p></Layout>

  const input = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon/30'
  const lbl = 'block text-xs font-semibold uppercase text-gray-600 mb-1'
  const ro = `${input} bg-gray-50 text-gray-500`

  return (
    <Layout>
      <div className="max-w-2xl">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center gap-3 border-b pb-4 mb-4">
            <div className="h-12 w-12 rounded-full bg-maroon/10 flex items-center justify-center">
              <User size={22} className="text-maroon" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{me.fullName}</h2>
              <p className="text-sm text-gray-500">Employee ID: {me.employeeId}</p>
            </div>
          </div>

          {notice && (
            <div className="mb-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
              <CheckCircle size={16} /> {notice}
            </div>
          )}
          {error && (
            <div className="mb-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
              <AlertCircle size={16} /> {error}
            </div>
          )}

          {/* read-only identity fields (set by administration) */}
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <div><label className={lbl}>Gender</label><input className={ro} value={me.gender === 'M' ? 'Male' : me.gender === 'F' ? 'Female' : '—'} readOnly /></div>
            <div><label className={lbl}>Date of Birth</label><input className={ro} value={fmtDate(me.dateOfBirth)} readOnly /></div>
            <div><label className={lbl}>Department</label><input className={ro} value={me.departmentName || '—'} readOnly /></div>
            <div><label className={lbl}>Office</label><input className={ro} value={me.officeName || '—'} readOnly /></div>
            <div><label className={lbl}>Joining Date</label><input className={ro} value={fmtDate(me.joiningDate)} readOnly /></div>
          </div>

          {/* editable contact fields */}
          <p className="text-xs font-semibold uppercase text-gray-400 mb-2">Editable Details</p>
          <div className="grid md:grid-cols-2 gap-3 mb-4">
            <div><label className={lbl}>Mobile (10 digits)</label><input className={input} value={form.mobileNumber} onChange={(e) => set('mobileNumber', e.target.value)} /></div>
            <div><label className={lbl}>Contact Email (login unchanged)</label><input type="email" className={input} value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
            <div className="md:col-span-2"><label className={lbl}>Designation</label><input className={input} value={form.designation} onChange={(e) => set('designation', e.target.value)} /></div>
          </div>

          <button onClick={save} disabled={busy}
            className="flex items-center justify-center gap-2 bg-maroon hover:bg-maroon-dark text-white font-semibold px-5 py-2.5 rounded disabled:opacity-60">
            <Save size={15} /> {busy ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </Layout>
  )
}
