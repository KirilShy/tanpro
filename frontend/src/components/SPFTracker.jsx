import { useState, useEffect } from 'react'

const SPF_LEVELS = [15, 30, 50, 100]
const REAPPLY_MS = 2 * 60 * 60 * 1000 // 2 hours

function fmtTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function fmtMinutes(ms) {
  if (ms <= 0) return 'now'
  const m = Math.ceil(ms / 60000)
  if (m < 60) return `${m} min`
  const h = Math.floor(m / 60)
  const rem = m % 60
  return rem > 0 ? `${h}h ${rem}m` : `${h}h`
}

export default function SPFTracker() {
  const [log, setLog] = useState(() => {
    try {
      const saved = localStorage.getItem('spfLog')
      const entries = saved ? JSON.parse(saved) : []
      // Only keep today's entries
      const todayStart = new Date().setHours(0, 0, 0, 0)
      return entries.filter(e => e.time >= todayStart)
    } catch {
      return []
    }
  })
  const [selectedSPF, setSelectedSPF] = useState(30)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(timer)
  }, [])

  const saveLog = (entries) => {
    setLog(entries)
    localStorage.setItem('spfLog', JSON.stringify(entries))
  }

  const apply = () => {
    const entry = {
      id: Date.now(),
      spf: selectedSPF,
      time: Date.now(),
      nextApply: Date.now() + REAPPLY_MS,
    }
    saveLog([entry, ...log])
  }

  const removeEntry = (id) => saveLog(log.filter(e => e.id !== id))

  const latest = log[0]
  const msUntilReapply = latest ? latest.nextApply - now : null
  const needsReapply = msUntilReapply !== null && msUntilReapply <= 0

  return (
    <div className="space-y-4">
      {/* Status banner */}
      {latest ? (
        <div className={`rounded-2xl p-4 border ${
          needsReapply
            ? 'bg-red-50 border-red-200'
            : msUntilReapply < 20 * 60 * 1000
            ? 'bg-amber-50 border-amber-200'
            : 'bg-green-50 border-green-200'
        }`}>
          <div className="flex items-start gap-3">
            <span className="text-2xl mt-0.5">
              {needsReapply ? '⚠️' : msUntilReapply < 20 * 60 * 1000 ? '⏰' : '✅'}
            </span>
            <div>
              <div className={`font-bold text-sm ${
                needsReapply ? 'text-red-700' : msUntilReapply < 20 * 60 * 1000 ? 'text-amber-700' : 'text-green-700'
              }`}>
                {needsReapply
                  ? 'Reapply sunscreen now!'
                  : msUntilReapply < 20 * 60 * 1000
                  ? `Reapply soon — ${fmtMinutes(msUntilReapply)} left`
                  : `SPF ${latest.spf} active`}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">
                {needsReapply
                  ? `Last applied at ${fmtTime(latest.time)} — overdue by ${fmtMinutes(-msUntilReapply)}`
                  : `Applied at ${fmtTime(latest.time)} · Reapply at ${fmtTime(latest.nextApply)}`}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4 text-sm text-orange-700">
          No SPF logged yet today. Apply sunscreen before going outside!
        </div>
      )}

      {/* Apply panel */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h2 className="text-sm font-semibold text-gray-600 mb-3">Log Application</h2>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {SPF_LEVELS.map(s => (
            <button
              key={s}
              onClick={() => setSelectedSPF(s)}
              className={`py-3 rounded-xl text-sm font-bold transition-all ${
                selectedSPF === s
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <button
          onClick={apply}
          className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-amber-400 text-white rounded-xl font-bold shadow hover:shadow-lg active:scale-95 transition-all"
        >
          🧴 Applied SPF {selectedSPF} — Log It
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">
          Reapply reminder in 2 hours
        </p>
      </div>

      {/* Pro tips */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">Application Tips</h3>
        <ul className="text-xs text-amber-700 space-y-1.5 leading-relaxed">
          <li>• Apply 15–30 minutes <strong>before</strong> going outside</li>
          <li>• Use ~1 oz (30ml) to cover your entire body</li>
          <li>• Reapply every 2 hours, or immediately after swimming/sweating</li>
          <li>• Don't forget ears, back of neck, tops of feet</li>
          <li>• Lips need SPF lip balm too</li>
        </ul>
      </div>

      {/* Today's log */}
      {log.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-gray-600">Today's Log</h2>
            <button
              onClick={() => saveLog([])}
              className="text-xs text-red-400 hover:text-red-600 transition"
            >
              Clear all
            </button>
          </div>
          <div className="space-y-0">
            {log.map((entry, i) => (
              <div
                key={entry.id}
                className={`flex items-center justify-between py-3 text-sm ${
                  i < log.length - 1 ? 'border-b border-gray-50' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🧴</span>
                  <div>
                    <span className="font-semibold text-gray-700">SPF {entry.spf}</span>
                    <span className="text-gray-400 ml-2 text-xs">at {fmtTime(entry.time)}</span>
                  </div>
                </div>
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="text-gray-300 hover:text-red-400 transition text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SPF guide */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">SPF Guide</h3>
        <div className="space-y-2">
          {[
            { spf: 15, blocks: '93%', for: 'Low UV, short time outside' },
            { spf: 30, blocks: '97%', for: 'Everyday outdoor use' },
            { spf: 50, blocks: '98%', for: 'High UV, beach, sport' },
            { spf: 100, blocks: '99%', for: 'Maximum protection' },
          ].map(row => (
            <div key={row.spf} className="flex items-center gap-3 text-xs">
              <div className="w-14 font-bold text-orange-500">SPF {row.spf}</div>
              <div className="w-10 text-gray-500">{row.blocks}</div>
              <div className="text-gray-400">{row.for}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
