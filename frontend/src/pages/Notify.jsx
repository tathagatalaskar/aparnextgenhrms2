import { useEffect, useState, useCallback } from 'react'
import { notificationApi, employeeApi, metaApi } from '../api/api'
import Layout from '../components/Layout'
import { Send, AlarmClock, AlertCircle, CheckCircle, RefreshCw, Megaphone } from 'lucide-react'

function fmtDate(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return d }
}

export default function Notify() {
  const [employees, setEmployees] = useState([])
  const [depts, setDepts] = useState([])
  const [pending, setPending] = useState([])
  const [pendingLoading, setPendingLoading] = useState(true)
  const [pendingError, setPendingError] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  // manual notification composer
  const [targetType, setTargetType] = useState('ALL')
  const [employeeIds, setEmployeeIds] = useState([])
  const [departmentId, setDepartmentId] = useState('')
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)

  const flash = (m) => { setNotice(m); setTimeout(() => setNotice(''), 4000) }

  const loadPending = useCallback(async () => {
    setPendingLoading(true)
    setPendingError('')
    try {
      const { data } = await notificationApi.pending()
      setPending(Array.isArray(data) ? data : [])
    } catch (e) {
      setPending([])
      setPendingError(e.response?.data?.error || 'Could not load pending APAR reports.')
    } finally {
      setPendingLoading(false)
    }
  }, [])

  useEffect(() => {
    employeeApi.list().then(({ data }) => setEmployees(data)).catch(() => {})
    metaApi.departments().then(({ data }) => setDepts(data)).catch(() => {})
    loadPending()
  }, [loadPending])

  const sendManual = async () => {
    setError('')
    if (!title.trim() || !message.trim()) { setError('Title and message are required.'); return }
    const selectedEmployeeIds = employeeIds.filter((id) => String(id).trim() !== '')
    if ((targetType === 'ONE' || targetType === 'MANY') && selectedEmployeeIds.length === 0) {
      setError('Select at least one employee.'); return
    }
    if (targetType === 'DEPARTMENT' && !departmentId) { setError('Select a department.'); return }
    setSending(true)
    try {
      const { data } = await notificationApi.send({
        targetType,
        employeeIds: selectedEmployeeIds.map(Number),
        departmentId: departmentId ? Number(departmentId) : null,
        title: title.trim(), message: message.trim(),
      })
      flash(data.message); setTitle(''); setMessage(''); setEmployeeIds([])
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to send')
    } finally { setSending(false) }
  }

  const remindOne = async (id) => {
    try { const { data } = await notificationApi.sendReminders([id]); flash(data.message); loadPending() }
    catch (e) { setError(e.response?.data?.error || 'Failed') }
  }
  const remindAllPending = async () => {
    const ids = pending.map((p) => p.employeeId)
    if (ids.length === 0) return
    try { const { data } = await notificationApi.sendReminders(ids); flash(data.message); loadPending() }
    catch (e) { setError(e.response?.data?.error || 'Failed') }
  }
  const runAuto = async () => {
    try { const { data } = await notificationApi.autoReminders(); flash(data.message); loadPending() }
    catch (e) { setError(e.response?.data?.error || 'Failed') }
  }

  const input = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon/30'
  const lbl = 'block text-xs font-semibold uppercase text-gray-600 mb-1'

  return (
    <Layout>
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

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Manual notification composer */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-xs font-bold uppercase tracking-widest text-maroon border-b border-maroon/30 pb-2 mb-4 flex items-center gap-2">
            <Megaphone size={14} /> Send Notification
          </h3>
          <div className="mb-3">
            <label className={lbl}>Send to</label>
            <select className={input} value={targetType} onChange={(e) => setTargetType(e.target.value)}>
              <option value="ALL">All employees</option>
              <option value="DEPARTMENT">A department</option>
              <option value="MANY">Selected employees</option>
              <option value="ONE">One employee</option>
            </select>
          </div>

          {targetType === 'DEPARTMENT' && (
            <div className="mb-3">
              <label className={lbl}>Department</label>
              <select className={input} value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
                <option value="">— Select —</option>
                {depts.map((d) => <option key={d.departmentId} value={d.departmentId}>{d.departmentName}</option>)}
              </select>
            </div>
          )}

          {(targetType === 'ONE' || targetType === 'MANY') && (
            <div className="mb-3">
              <label className={lbl}>Employees {targetType === 'MANY' ? '(Ctrl/Cmd-click for multiple)' : ''}</label>
              <select multiple={targetType === 'MANY'} className={`${input} h-40`}
                value={targetType === 'ONE' ? employeeIds[0] || '' : employeeIds}
                onChange={(e) => {
                  if (targetType === 'ONE') setEmployeeIds(e.target.value ? [e.target.value] : [])
                  else setEmployeeIds(Array.from(e.target.selectedOptions, (o) => o.value))
                }}>
                {targetType === 'ONE' && <option value="">— Select —</option>}
                {employees.map((emp) => (
                  <option key={emp.employeeId} value={emp.employeeId}>
                    {emp.fullName} (ID {emp.employeeId}) · {emp.departmentName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="mb-3">
            <label className={lbl}>Title</label>
            <input className={input} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notice title" />
          </div>
          <div className="mb-4">
            <label className={lbl}>Message</label>
            <textarea rows={4} className={`${input} resize-none`} value={message}
              onChange={(e) => setMessage(e.target.value)} placeholder="Type your message…" />
          </div>
          <button onClick={sendManual} disabled={sending}
            className="w-full flex items-center justify-center gap-2 bg-maroon hover:bg-maroon-dark text-white font-semibold py-2.5 rounded disabled:opacity-60">
            <Send size={15} /> {sending ? 'Sending…' : 'Send Notification'}
          </button>
        </div>

        {/* Pending APAR + reminders */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-center justify-between border-b border-maroon/30 pb-2 mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-maroon flex items-center gap-2">
              <AlarmClock size={14} /> Pending APAR Reports
            </h3>
            <button onClick={runAuto} title="Run automatic reminder sweep"
              className="text-[11px] text-maroon font-semibold flex items-center gap-1">
              <RefreshCw size={12} /> Auto-remind
            </button>
          </div>

          {pendingLoading ? (
            <p className="text-sm text-gray-400 py-6 text-center">Loading pending reports…</p>
          ) : pendingError ? (
            <p className="text-sm text-red-600 py-6 text-center">{pendingError}</p>
          ) : pending.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">Everyone has submitted. 🎉</p>
          ) : (
            <>
              <div className="flex justify-end mb-2">
                <button onClick={remindAllPending}
                  className="text-xs font-semibold border border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded">
                  Remind all ({pending.length})
                </button>
              </div>
              <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
                {pending.map((p) => (
                  <div key={p.employeeId} className="flex items-center justify-between py-2.5">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{p.fullName}</p>
                      <p className="text-xs text-gray-500">{p.departmentName} · due {fmtDate(p.dueDate)}
                        {p.reminded && <span className="text-amber-600"> · reminded</span>}</p>
                    </div>
                    <button onClick={() => remindOne(p.employeeId)}
                      className="text-xs font-semibold text-maroon hover:underline">
                      {p.reminded ? 'Remind again' : 'Send reminder'}
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  )
}
