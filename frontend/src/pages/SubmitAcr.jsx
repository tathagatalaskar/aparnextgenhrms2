import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { acrApi } from '../api/api'
import Layout from '../components/Layout'
import { Send, Plus, Trash2, ArrowLeft, AlertCircle, Lock } from 'lucide-react'

const MAX_TARGETS = 15

export default function SubmitAcr() {
  const navigate = useNavigate()
  const [elig, setElig] = useState(null)
  const [loadingElig, setLoadingElig] = useState(true)
  const [targets, setTargets] = useState([{ target: '', achievements: '' }])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    acrApi.eligibility()
      .then(({ data }) => setElig(data))
      .catch(() => setElig(null))
      .finally(() => setLoadingElig(false))
  }, [])

  const setTarget = (i, k, v) =>
    setTargets((ts) => ts.map((t, j) => (j === i ? { ...t, [k]: v } : t)))

  const submit = async () => {
    setError('')
    const clean = targets.filter((t) => t.target.trim() && t.achievements.trim())
    if (clean.length === 0) { setError('Add at least one target and achievement.'); return }
    setBusy(true)
    try {
      const { data } = await acrApi.submit({ assessmentYear: elig.assessmentYear, targets: clean })
      navigate(`/acr/${data.statusId}`)
    } catch (e) {
      setError(e.response?.data?.error || 'Submission failed')
    } finally { setBusy(false) }
  }

  const input = 'w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-maroon/30'

  if (loadingElig) return <Layout><p className="text-sm text-gray-500">Loading…</p></Layout>

  // Gate: form only available when the authority has sent a reminder
  if (!elig || !elig.canSubmit) {
    return (
      <Layout>
        <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm text-maroon mb-4">
          <ArrowLeft size={16} /> Back
        </button>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <Lock size={28} className="mx-auto text-gray-400" />
          <p className="mt-3 text-sm font-semibold text-gray-700">APAR form is locked</p>
          <p className="text-xs text-gray-500 mt-1 max-w-md mx-auto">
            {elig?.alreadySubmitted
              ? 'You have already submitted your APAR for this cycle.'
              : 'The form unlocks only after the reporting authority sends you an APAR reminder. You will be notified.'}
          </p>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <button onClick={() => navigate('/')} className="flex items-center gap-1 text-sm text-maroon mb-4">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between border-b border-maroon/30 pb-2 mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-maroon">Submit APAR — Self Appraisal</h2>
          <span className="text-xs text-gray-500">Cycle {elig.assessmentYear} · due {elig.dueDate}</span>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-700 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <label className="text-xs font-semibold uppercase text-gray-600">Targets &amp; Achievements *</label>
            <p className="text-[11px] text-gray-400 mt-0.5">{targets.length} of {MAX_TARGETS} rows</p>
          </div>
          <button type="button" disabled={targets.length >= MAX_TARGETS}
            onClick={() => setTargets((ts) => ts.length < MAX_TARGETS ? [...ts, { target: '', achievements: '' }] : ts)}
            className="flex items-center gap-1 text-xs font-semibold text-maroon disabled:opacity-40">
            <Plus size={14} /> Add Row
          </button>
        </div>
        <table className="w-full text-sm border border-gray-200 rounded overflow-hidden mb-4">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-3 py-2 text-left">Target</th>
              <th className="px-3 py-2 text-left">Achievement</th>
              <th className="px-3 py-2 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {targets.map((t, i) => (
              <tr key={i}>
                <td className="px-3 py-2">
                  <input maxLength={2000} className={`${input} text-xs`} placeholder="Target set for the year"
                    value={t.target} onChange={(e) => setTarget(i, 'target', e.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <input maxLength={2000} className={`${input} text-xs`} placeholder="What you achieved"
                    value={t.achievements} onChange={(e) => setTarget(i, 'achievements', e.target.value)} />
                </td>
                <td className="px-3 py-2 text-center">
                  {i > 0 && (
                    <button type="button" onClick={() => setTargets((ts) => ts.filter((_, j) => j !== i))}
                      className="text-gray-400 hover:text-red-600">
                      <Trash2 size={14} />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <button disabled={busy} onClick={submit}
          className="w-full flex items-center justify-center gap-2 bg-maroon hover:bg-maroon-dark text-white font-semibold py-2.5 rounded disabled:opacity-60">
          <Send size={15} /> {busy ? 'Submitting…' : 'Submit APAR'}
        </button>
      </div>
    </Layout>
  )
}
