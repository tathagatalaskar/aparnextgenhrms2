import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { acrApi } from '../api/api'
import { useAuth } from '../context/AuthContext'
import Layout from '../components/Layout'
import StatusBadge from '../components/StatusBadge'
import { Plus, ChevronRight, Inbox, AlarmClock, Lock, CheckCircle } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [elig, setElig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isEmployee = user.role === 'EMPLOYEE'

  useEffect(() => {
    let active = true
    const fetchAll = (initial) => {
      acrApi.list()
        .then(({ data }) => { if (active) setRows(data) })
        .catch((e) => { if (active && initial) setError(e.response?.data?.error || 'Failed to load') })
        .finally(() => { if (active && initial) setLoading(false) })
      if (isEmployee) {
        acrApi.eligibility().then(({ data }) => { if (active) setElig(data) }).catch(() => {})
      }
    }
    fetchAll(true)
    // near-real-time: picks up a freshly-sent APAR reminder within ~10s and unlocks the form
    const timer = setInterval(() => fetchAll(false), 10000)
    return () => { active = false; clearInterval(timer) }
  }, [isEmployee])

  return (
    <Layout>
      {/* Employee APAR status banner */}
      {isEmployee && elig && (
        <div className="mb-5">
          {elig.canSubmit ? (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <div className="flex items-center gap-3">
                <AlarmClock size={20} className="text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">APAR submission requested</p>
                  <p className="text-xs text-amber-700">
                    Cycle {elig.assessmentYear} · due {elig.dueDate}. Please fill and submit your report.
                  </p>
                </div>
              </div>
              <button onClick={() => navigate('/submit')}
                className="flex items-center gap-1.5 text-xs font-semibold bg-maroon hover:bg-maroon-dark text-white px-3 py-2 rounded">
                <Plus size={14} /> Fill APAR Report
              </button>
            </div>
          ) : elig.alreadySubmitted ? (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
              <CheckCircle size={20} className="text-green-600" />
              <p className="text-sm text-green-800">
                You have submitted your APAR for {elig.assessmentYear}. Awaiting / completed review.
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <Lock size={18} className="text-gray-400" />
              <p className="text-sm text-gray-600">
                No APAR submission has been requested yet. You'll be notified when the reporting
                authority asks you to submit — the form will unlock here automatically.
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold uppercase tracking-widest text-maroon">
          {isEmployee ? 'My ACR Reports' : 'All Submitted ACRs'}
        </h2>
      </div>

      {loading && <p className="text-sm text-gray-500">Loading…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && rows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <Inbox size={40} />
          <p className="mt-2 text-sm">
            {isEmployee ? 'No ACR submitted yet.' : 'No ACRs submitted yet.'}
          </p>
        </div>
      )}

      <div className="grid gap-3">
        {rows.map((r) => (
          <button key={r.statusId} onClick={() => navigate(`/acr/${r.statusId}`)}
            className="flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3 hover:shadow transition-shadow text-left">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-800">{r.fullName}</span>
                <span className="text-xs text-gray-400">(ID {r.employeeId})</span>
              </div>
              <p className="text-xs text-gray-500">
                {r.departmentName} · Cycle {r.assessmentYear}{r.grade ? ` · Grade: ${r.grade}` : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge submitted={r.submitted} reviewed={r.reviewed} flagged={r.flagged} />
              <ChevronRight size={18} className="text-gray-400" />
            </div>
          </button>
        ))}
      </div>
    </Layout>
  )
}
