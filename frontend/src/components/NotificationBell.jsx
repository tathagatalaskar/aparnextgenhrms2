import { useEffect, useRef, useState, useCallback } from 'react'
import { notificationApi } from '../api/api'
import { Bell, Mail, AlarmClock, Megaphone, Check } from 'lucide-react'

const ICON = { MANUAL: Mail, APAR_REMINDER: AlarmClock, ANNOUNCEMENT: Megaphone }

function timeAgo(iso) {
  if (!iso) return ''
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [count, setCount] = useState(0)
  const [items, setItems] = useState([])
  const ref = useRef(null)

  const refreshCount = useCallback(() => {
    notificationApi.unreadCount().then(({ data }) => setCount(data.count || 0)).catch(() => {})
  }, [])

  const loadList = useCallback(() => {
    notificationApi.list().then(({ data }) => setItems(data)).catch(() => {})
  }, [])

  useEffect(() => {
    refreshCount()
    const t = setInterval(refreshCount, 10000) // near-real-time polling
    return () => clearInterval(t)
  }, [refreshCount])

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const toggle = () => {
    const next = !open
    setOpen(next)
    if (next) loadList()
  }

  const markRead = async (id) => {
    // optimistic: update the item and decrement the badge immediately
    setItems((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)))
    setCount((c) => Math.max(0, c - 1))
    try {
      await notificationApi.markRead(id)
    } catch {
      // revert on failure
      setItems((list) => list.map((n) => (n.id === id ? { ...n, read: false } : n)))
    }
    refreshCount()
  }
  const markAll = async () => {
    setItems((list) => list.map((n) => ({ ...n, read: true })))
    setCount(0)
    try {
      await notificationApi.markAllRead()
    } catch {
      loadList()
    }
    refreshCount()
  }

  return (
    <div className="relative" ref={ref}>
      <button onClick={toggle} className="relative p-2 rounded hover:bg-white/10">
        <Bell size={18} />
        {count > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-yellow-400 text-maroon text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
            {count > 9 ? '9+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white text-gray-800 rounded-lg shadow-xl border border-gray-200 z-50 max-h-[28rem] overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 border-b">
            <span className="text-sm font-bold text-maroon">Notifications</span>
            {items.some((i) => !i.read) && (
              <button onClick={markAll} className="text-[11px] text-maroon font-semibold flex items-center gap-1">
                <Check size={12} /> Mark all read
              </button>
            )}
          </div>
          <div className="overflow-y-auto">
            {items.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No notifications.</p>}
            {items.map((n) => {
              const Icon = ICON[n.type] || Bell
              return (
                <button key={n.id} onClick={() => !n.read && markRead(n.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-50 hover:bg-gray-50 flex gap-3 ${
                    n.read ? '' : 'bg-maroon/5'}`}>
                  <Icon size={16} className={`mt-0.5 shrink-0 ${n.type === 'APAR_REMINDER' ? 'text-amber-600' : 'text-maroon'}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold leading-tight">{n.title}</p>
                    <p className="text-xs text-gray-600 mt-0.5">{n.message}</p>
                    <p className="text-[10px] text-gray-400 mt-1">
                      {n.senderName || 'System'} · {timeAgo(n.createdAt)}
                    </p>
                  </div>
                  {!n.read && <span className="ml-auto mt-1 h-2 w-2 rounded-full bg-maroon shrink-0" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
