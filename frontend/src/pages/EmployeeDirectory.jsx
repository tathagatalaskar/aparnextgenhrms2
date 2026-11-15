import { useEffect, useState, useCallback } from 'react'
import { employeeApi, metaApi, notificationApi } from '../api/api'
import Layout from '../components/Layout'
import { Users, Search, Plus, X, Power, Trash2, Pencil, AlarmClock, AlertCircle, CheckCircle } from 'lucide-react'

function fmtDate(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return d }
}
const EMPTY = {
  empIniName: 'Shri', empFirstName: '', empMidName: '', empLastName: '',
  gender: 'M', dateOfBirth: '', departmentId: '', officeId: '', designation: '',
  joiningDate: '', mobileNumber: '', email: '', createLogin: false, password: '',
}

export default function EmployeeDirectory() {
  const [rows, setRows] = useState([])
  const [depts, setDepts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [q, setQ] = useState('')
  const [selected, setSelected] = useState(new Set())
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const load = useCallback(() => {
    employeeApi.list()
      .then(({ data }) => setRows(data))
      .catch((e) => setError(e.response?.data?.error || 'Failed to load directory'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    load()
    metaApi.departments().then(({ data }) => setDepts(data)).catch(() => {})
  }, [load])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const flash = (m) => { setNotice(m); setTimeout(() => setNotice(''), 4000) }

  const openAdd = () => { setEditingId(null); setForm(EMPTY); setError(''); setShowForm(true) }
  const openEdit = (r) => {
    setEditingId(r.employeeId)
    setError('')
    setForm({
      empIniName: r.empIniName || 'Shri', empFirstName: r.empFirstName || '', empMidName: r.empMidName || '',
      empLastName: r.empLastName || '', gender: r.gender || 'M',
      dateOfBirth: r.dateOfBirth || '', departmentId: r.departmentId ?? '', officeId: r.officeId ?? '',
      designation: r.designation || '', joiningDate: r.joiningDate || '',
      mobileNumber: r.mobileNumber || '', email: r.email || '', createLogin: false, password: '',
    })
    setShowForm(true)
  }

  const toggleSel = (id) => setSelected((s) => {
    const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n
  })

  const saveEmployee = async () => {
    setError('')
    if (!form.empFirstName.trim() || !form.empLastName.trim() || !form.dateOfBirth || !form.departmentId) {
      setError('First name, last name, DOB and department are required.'); return
    }
    if (!editingId && form.createLogin && (!form.email || form.password.length < 8)) {
      setError('To create a login, provide an email and an 8+ char password.'); return
    }
    setSaving(true)
    const payload = {
      empIniName: form.empIniName || null, empFirstName: form.empFirstName, empMidName: form.empMidName || null,
      empLastName: form.empLastName, gender: form.gender, dateOfBirth: form.dateOfBirth,
      departmentId: Number(form.departmentId), officeId: form.officeId ? Number(form.officeId) : null,
      designation: form.designation || null, joiningDate: form.joiningDate || null,
      mobileNumber: form.mobileNumber || null, email: form.email || null,
    }
    try {
      if (editingId) {
        await employeeApi.update(editingId, payload)
        flash('Employee updated successfully.')
      } else {
        await employeeApi.add({ ...payload, createLogin: form.createLogin, password: form.createLogin ? form.password : null })
        flash('Employee added successfully.')
      }
      setShowForm(false); setEditingId(null); setForm(EMPTY); load()
    } catch (e) {
      const d = e.response?.data
      setError(d?.error || Object.values(d?.fields || {})[0] || 'Failed to save employee')
    } finally { setSaving(false) }
  }

  const toggleActive = async (emp) => {
    try { await employeeApi.setActive(emp.employeeId, !emp.active); load() }
    catch (e) { setError(e.response?.data?.error || 'Failed to update status') }
  }

  const removeEmp = async (emp) => {
    if (!window.confirm(`Delete ${emp.fullName} (ID ${emp.employeeId})? This removes their records and login.`)) return
    try { await employeeApi.remove(emp.employeeId); flash('Employee deleted.'); load() }
    catch (e) { setError(e.response?.data?.error || 'Failed to delete') }
  }

  const sendReminders = async () => {
    if (selected.size === 0) { setError('Select at least one employee.'); return }
    try {
      const { data } = await notificationApi.sendReminders([...selected])
      flash(data.message); setSelected(new Set())
    } catch (e) { setError(e.response?.data?.error || 'Failed to send reminders') }
  }

  const filtered = rows.filter((r) =>
    r.fullName.toLowerCase().includes(q.toLowerCase()) ||
    String(r.employeeId).includes(q) ||
    (r.departmentName || '').toLowerCase().includes(q.toLowerCase())
  )

  const input = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon/30'
  const lbl = 'block text-xs font-semibold uppercase text-gray-600 mb-1'

  return (
    <Layout>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-sm font-bold uppercase tracking-widest text-maroon flex items-center gap-2">
          <Users size={16} /> Employee Management
        </h2>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-2 top-2.5 text-gray-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search…"
              className="pl-7 pr-3 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-maroon/30 w-40" />
          </div>
          <button onClick={sendReminders} disabled={selected.size === 0}
            className="flex items-center gap-1.5 text-xs font-semibold border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-2 rounded disabled:opacity-50">
            <AlarmClock size={14} /> Send APAR Reminder{selected.size > 0 ? ` (${selected.size})` : ''}
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-1.5 text-xs font-semibold bg-maroon hover:bg-maroon-dark text-white px-3 py-2 rounded">
            <Plus size={14} /> Add Employee
          </button>
        </div>
      </div>

      {notice && (
        <div className="mb-3 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          <CheckCircle size={16} /> {notice}
        </div>
      )}
      {error && !showForm && (
        <div className="mb-3 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {loading ? <p className="text-sm text-gray-500">Loading…</p> : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-x-auto">
          <table className="w-full text-sm min-w-[920px]">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-3 py-3 w-8"></th>
                <th className="px-4 py-3 text-left">Emp ID</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Gender</th>
                <th className="px-4 py-3 text-left">DOB</th>
                <th className="px-4 py-3 text-left">Designation</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Mobile</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((r) => (
                <tr key={r.employeeId} className="hover:bg-gray-50/50">
                  <td className="px-3 py-2.5 text-center">
                    <input type="checkbox" checked={selected.has(r.employeeId)} onChange={() => toggleSel(r.employeeId)} />
                  </td>
                  <td className="px-4 py-2.5 font-medium text-gray-700">{r.employeeId}</td>
                  <td className="px-4 py-2.5">{r.fullName}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      r.gender === 'M' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                      {r.gender === 'M' ? 'Male' : r.gender === 'F' ? 'Female' : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">{fmtDate(r.dateOfBirth)}</td>
                  <td className="px-4 py-2.5">{r.designation || '—'}</td>
                  <td className="px-4 py-2.5">{r.departmentName || '—'}</td>
                  <td className="px-4 py-2.5">{r.mobileNumber || '—'}</td>
                  <td className="px-4 py-2.5">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      r.active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {r.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => openEdit(r)} title="Edit"
                        className="p-1.5 rounded text-gray-600 hover:bg-gray-100">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => toggleActive(r)} title={r.active ? 'Deactivate' : 'Activate'}
                        className={`p-1.5 rounded ${r.active ? 'text-amber-600 hover:bg-amber-50' : 'text-green-600 hover:bg-green-50'}`}>
                        <Power size={14} />
                      </button>
                      <button onClick={() => removeEmp(r)} title="Delete"
                        className="p-1.5 rounded text-red-600 hover:bg-red-50">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={10} className="px-4 py-6 text-center text-gray-400">No employees found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h3 className="font-bold text-gray-800">{editingId ? 'Edit Employee' : 'Add Employee'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="px-6 py-4">
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3">
                  <AlertCircle size={16} /> {error}
                </div>
              )}
              <div className="grid md:grid-cols-3 gap-3">
                <div>
                  <label className={lbl}>Title</label>
                  <select className={input} value={form.empIniName} onChange={(e) => set('empIniName', e.target.value)}>
                    <option>Shri</option><option>Smt</option><option>Kum</option><option>Dr</option>
                  </select>
                </div>
                <div><label className={lbl}>First Name *</label><input className={input} value={form.empFirstName} onChange={(e) => set('empFirstName', e.target.value)} /></div>
                <div><label className={lbl}>Middle</label><input className={input} value={form.empMidName} onChange={(e) => set('empMidName', e.target.value)} /></div>
                <div><label className={lbl}>Last Name *</label><input className={input} value={form.empLastName} onChange={(e) => set('empLastName', e.target.value)} /></div>
                <div>
                  <label className={lbl}>Gender *</label>
                  <select className={input} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
                    <option value="M">Male</option><option value="F">Female</option>
                  </select>
                </div>
                <div><label className={lbl}>DOB *</label><input type="date" className={input} value={form.dateOfBirth} onChange={(e) => set('dateOfBirth', e.target.value)} /></div>
                <div>
                  <label className={lbl}>Department *</label>
                  <select className={input} value={form.departmentId} onChange={(e) => set('departmentId', e.target.value)}>
                    <option value="">— Select —</option>
                    {depts.map((d) => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
                  </select>
                </div>
                <div><label className={lbl}>Designation</label><input className={input} value={form.designation} onChange={(e) => set('designation', e.target.value)} /></div>
                <div><label className={lbl}>Joining Date</label><input type="date" className={input} value={form.joiningDate} onChange={(e) => set('joiningDate', e.target.value)} /></div>
                <div><label className={lbl}>Mobile</label><input className={input} value={form.mobileNumber} onChange={(e) => set('mobileNumber', e.target.value)} /></div>
                <div className="md:col-span-2"><label className={lbl}>Email</label><input type="email" className={input} value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
              </div>
              {!editingId && (
              <label className="flex items-center gap-2 text-sm mt-4 cursor-pointer">
                <input type="checkbox" checked={form.createLogin} onChange={(e) => set('createLogin', e.target.checked)} />
                Also create a login account for this employee
              </label>
              )}
              {!editingId && form.createLogin && (
                <div className="mt-2">
                  <label className={lbl}>Temporary Password (min 8)</label>
                  <input type="password" className={input} value={form.password} onChange={(e) => set('password', e.target.value)} />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 px-6 py-4 border-t bg-gray-50">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm rounded border border-gray-300 hover:bg-gray-100">Cancel</button>
              <button onClick={saveEmployee} disabled={saving}
                className="px-4 py-2 text-sm rounded bg-maroon hover:bg-maroon-dark text-white font-semibold disabled:opacity-60">
                {saving ? 'Saving…' : editingId ? 'Save Changes' : 'Add Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
