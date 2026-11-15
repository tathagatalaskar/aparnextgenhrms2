export default function StatusBadge({ submitted, reviewed, flagged }) {
  let label = 'Not Submitted', color = '#6b7280'
  if (reviewed) { label = 'Reviewed'; color = '#16a34a' }
  else if (submitted) { label = 'Submitted'; color = '#b45309' }
  return (
    <span className="inline-flex items-center gap-2">
      <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white"
        style={{ backgroundColor: color }}>{label}</span>
      {flagged && (
        <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold text-white bg-red-600">
          Flagged
        </span>
      )}
    </span>
  )
}
