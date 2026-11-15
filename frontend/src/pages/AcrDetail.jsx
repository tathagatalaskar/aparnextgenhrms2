import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { acrApi } from '../api/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import { ArrowLeft, Send, AlertTriangle, CheckCircle, Flag, User } from 'lucide-react'

const GRADES = ['Outstanding', 'Very Good', 'Good', 'Average', 'Below Average']

function fmtDate(d) {
  if (!d) return '—'
  try { return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) }
  catch { return d }
}

export default function AcrDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [acr, setAcr] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  const [grade, setGrade] = useState('')
  const [remarks, setRemarks] = useState('')
  const [flagged, setFlagged] = useState(false)
  const [flagReason, setFlagReason] = useState('')

  const load = useCallback(async () => {
    try {
      const { data } = await acrApi.detail(id)
      setAcr(data)
      setGrade(data.grade || '')
      setRemarks(data.authorityRemarks || '')
      setFlagged(data.flagged || false)
      setFlagReason(data.flagReason || '')
    } catch (e) {
      setError(e.response?.data?.error || 'Failed to load ACR')
    }
  }, [id])

  useEffect(() => { load() }, [load])

  const submitReview = async () => {
    setError(''); setNotice(''); setBusy(true)
    if (!grade) { setError('Please select a grade.'); setBusy(false); return }
    if (flagged && !flagReason.trim()) { setError('Please give a flag reason.'); setBusy(false); return }
    try {
      const { data } = await acrApi.review(id, { grade, remarks, flagged, flagReason })
      setAcr(data); setNotice('Review saved successfully.')
    } catch (e) {
      setError(e.response?.data?.error || 'Review failed')
    } finally { setBusy(false) }
  }

  if (!acr) {
    return <Layout>{error ? <p className="text-red-600 text-sm">{error}</p> : <p className="text-sm text-gray-500">Loading…</p>}</Layout>
  }

  const isAuthority = user.role === 'AUTHORITY'
  const input = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon/30'
  const genderLabel = acr.gender === 'M' ? 'Male' : acr.gender === 'F' ? 'Female' : '—'

  return (
    <Layout>
      <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm text-maroon mb-4">
        <ArrowLeft size={16} /> Back to dashboard
      </button>

      {notice && (
        <div className="mb-4 flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
          <CheckCircle size={16} /> {notice}
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {/* Employee info card */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-maroon/10 flex items-center justify-center">
              <User size={22} className="text-maroon" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-800">{acr.fullName}</h2>
              <p className="text-sm text-gray-500">Employee ID: {acr.employeeId} · Cycle {acr.assessmentYear}</p>
            </div>
          </div>
          <StatusBadge submitted={acr.submitted} reviewed={acr.reviewedAt != null} flagged={acr.flagged} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          <Info label="Gender" value={genderLabel} />
          <Info label="Date of Birth" value={fmtDate(acr.dateOfBirth)} />
          <Info label="Department" value={acr.departmentName || '—'} />
          <Info label="Office" value={acr.officeName || '—'} />
        </div>
      </div>

      {/* Targets */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-5">
        <h3 className="text-xs font-bold uppercase tracking-widest text-maroon border-b border-maroon/30 pb-2 mb-3">
          Targets &amp; Achievements
        </h3>
        <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr><th className="px-3 py-2 text-left w-1/2">Target</th><th className="px-3 py-2 text-left">Achievement</th></tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {acr.targets.length === 0 && (
              <tr><td colSpan={2} className="px-3 py-4 text-center text-gray-400">No targets recorded.</td></tr>
            )}
            {acr.targets.map((t, i) => (
              <tr key={i}>
                <td className="px-3 py-2">{t.target}</td>
                <td className="px-3 py-2">{t.achievements}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-maroon border-b border-maroon/30 pb-2 mb-4">
          Authority Review
        </h3>

        {isAuthority ? (
          <>
            <div className="mb-4 max-w-xs">
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Grade *</label>
              <select className={input} value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option value="">— Select grade —</option>
                {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Remarks</label>
              <textarea rows={3} className={`${input} resize-none`} value={remarks}
                onChange={(e) => setRemarks(e.target.value)} placeholder="Assessment remarks…" />
            </div>
            <label className="flex items-center gap-2 text-sm mb-3 cursor-pointer">
              <input type="checkbox" checked={flagged} onChange={(e) => setFlagged(e.target.checked)} />
              <Flag size={14} className="text-red-600" /> Flag this ACR for further review
            </label>
            {flagged && (
              <div className="mb-4">
                <label className="block text-xs font-semibold uppercase text-gray-600 mb-1">Flag Reason</label>
                <input className={input} value={flagReason} onChange={(e) => setFlagReason(e.target.value)}
                  placeholder="Why is this being flagged?" />
              </div>
            )}
            <button disabled={busy} onClick={submitReview}
              className="w-full flex items-center justify-center gap-2 bg-maroon hover:bg-maroon-dark text-white font-semibold py-2.5 rounded disabled:opacity-60">
              <Send size={15} /> {busy ? 'Saving…' : 'Save Review'}
            </button>
          </>
        ) : (
          acr.reviewedAt ? (
            <div className="space-y-3">
              <Info label="Grade" value={acr.grade} strong />
              {acr.authorityRemarks && <Info label="Remarks" value={acr.authorityRemarks} />}
              {acr.flagged && (
                <div className="flex items-start gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2">
                  <AlertTriangle size={16} className="mt-0.5" />
                  <span><b>Flagged:</b> {acr.flagReason}</span>
                </div>
              )}
              <p className="text-xs text-gray-400">Reviewed by {acr.reviewedByName}</p>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Your ACR is awaiting review by the authority.</p>
          )
        )}
      </div>
    </Layout>
  )
}

function Info({ label, value, strong }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase text-gray-400">{label}</p>
      <p className={strong ? 'text-sm font-semibold text-gray-800' : 'text-sm text-gray-700'}>{value}</p>
    </div>
  )
}
