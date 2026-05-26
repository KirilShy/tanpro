import { useState, useEffect } from 'react'

const SPF_OPTIONS = [
  { value: 1, label: 'None' },
  { value: 15, label: 'SPF 15' },
  { value: 30, label: 'SPF 30' },
  { value: 50, label: 'SPF 50' },
]

const UV_META = [
  { max: 2, label: 'Low', color: '#4ade80', bg: 'bg-green-100', text: 'text-green-700', advice: 'Too weak for tanning. No protection needed.' },
  { max: 5, label: 'Moderate', color: '#facc15', bg: 'bg-yellow-100', text: 'text-yellow-700', advice: 'Good for gradual tan. Use SPF 15+.' },
  { max: 7, label: 'High', color: '#fb923c', bg: 'bg-orange-100', text: 'text-orange-700', advice: 'Best tanning window. Use SPF 30+ and limit time.' },
  { max: 10, label: 'Very High', color: '#f87171', bg: 'bg-red-100', text: 'text-red-700', advice: 'Shorten session, use SPF 50+, take frequent shade breaks.' },
  { max: Infinity, label: 'Extreme', color: '#a855f7', bg: 'bg-purple-100', text: 'text-purple-700', advice: 'Avoid direct exposure. Serious burn risk in minutes.' },
]

function getUVMeta(uv) {
  return UV_META.find(m => uv <= m.max)
}

function formatMin(min) {
  if (!min && min !== 0) return '--'
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function formatTime(isoStr) {
  if (!isoStr) return '--'
  return new Date(isoStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function formatDate(isoStr) {
  if (!isoStr) return ''
  const d = new Date(isoStr)
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })
}

function UVChart({ data }) {
  const now = new Date().getHours()
  const slice = data.slice(6, 22)
  const max = Math.max(...slice.map(d => d.uv), 1)

  return (
    <div className="flex items-end gap-px" style={{ height: 72 }}>
      {slice.map((d, i) => {
        const hour = 6 + i
        const pct = Math.max((d.uv / max) * 100, 2)
        const meta = getUVMeta(d.uv)
        const isNow = hour === now
        return (
          <div key={i} className="flex-1 flex flex-col items-center justify-end gap-0.5" style={{ height: '100%' }}>
            <div className="w-full flex flex-col justify-end" style={{ height: 60 }}>
              <div
                className={`w-full rounded-sm ${isNow ? 'ring-1 ring-orange-500 ring-offset-1' : ''}`}
                style={{ height: `${pct}%`, backgroundColor: meta.color, opacity: isNow ? 1 : 0.65 }}
              />
            </div>
            {hour % 4 === 0 && (
              <span className="text-[9px] text-gray-400 leading-none">{hour}h</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function ForecastCard({ day }) {
  const meta = getUVMeta(day.uv_max)
  const tanQuality = day.uv_max < 3 ? 'Poor' : day.uv_max <= 5 ? 'Good' : day.uv_max <= 8 ? 'Excellent' : 'Caution'
  const tanColor = day.uv_max < 3 ? 'text-gray-400' : day.uv_max <= 5 ? 'text-yellow-600' : day.uv_max <= 8 ? 'text-green-600' : 'text-red-500'

  return (
    <div className="bg-white rounded-xl shadow-sm p-3 text-center">
      <div className="text-xs font-semibold text-gray-500 mb-2">{formatDate(day.date)}</div>
      <div
        className="w-10 h-10 rounded-full mx-auto flex items-center justify-center text-white font-black text-lg mb-2 shadow"
        style={{ backgroundColor: meta.color }}
      >
        {day.uv_max}
      </div>
      <div className={`text-[10px] font-bold ${meta.text}`}>{meta.label}</div>
      <div className={`text-[10px] font-semibold mt-1 ${tanColor}`}>{tanQuality} tan day</div>
    </div>
  )
}

export default function Dashboard({ uvData, skinProfile }) {
  const [spf, setSpf] = useState(30)
  const [exposure, setExposure] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!uvData) return
    if (uvData.current_uv === 0) {
      setExposure({ tan_minutes: null, burn_minutes: null, message: 'UV index is 0 right now — no tanning possible.' })
      return
    }
    setLoading(true)
    fetch('/api/safe-exposure', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skin_type: skinProfile.type, uv_index: uvData.current_uv, spf }),
    })
      .then(r => r.json())
      .then(data => { setExposure(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [uvData, skinProfile, spf])

  const bestWindow = () => {
    if (!uvData?.best_hours?.length) return null
    const first = uvData.best_hours[0]
    const last = uvData.best_hours[uvData.best_hours.length - 1]
    return `${formatTime(first.time)} – ${formatTime(last.time)}`
  }

  const uvMeta = uvData ? getUVMeta(uvData.current_uv) : null

  return (
    <div className="space-y-4">
      {/* Skin profile */}
      <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-3">
        <div className="w-11 h-11 rounded-full border-2 border-white shadow" style={{ backgroundColor: skinProfile.color }} />
        <div className="flex-1">
          <div className="font-semibold text-gray-800">{skinProfile.typeName}</div>
          <div className="text-xs text-gray-500">{skinProfile.description}</div>
        </div>
      </div>

      {/* UV advice banner */}
      {uvMeta && uvData && (
        <div className={`rounded-2xl p-3.5 ${uvMeta.bg}`}>
          <div className="flex items-start gap-2">
            <span className="text-lg">
              {uvData.current_uv <= 2 ? '😶' : uvData.current_uv <= 5 ? '😊' : uvData.current_uv <= 7 ? '😎' : uvData.current_uv <= 10 ? '⚠️' : '🚨'}
            </span>
            <div>
              <div className={`text-sm font-bold ${uvMeta.text}`}>UV {uvData.current_uv} — {uvMeta.label}</div>
              <div className={`text-xs mt-0.5 ${uvMeta.text} opacity-80`}>{uvMeta.advice}</div>
            </div>
          </div>
        </div>
      )}

      {/* SPF selector */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h2 className="text-sm font-semibold text-gray-600 mb-3">Current Protection</h2>
        <div className="grid grid-cols-4 gap-2">
          {SPF_OPTIONS.map(s => (
            <button
              key={s.value}
              onClick={() => setSpf(s.value)}
              className={`py-2.5 rounded-xl text-sm font-semibold transition-all ${
                spf === s.value ? 'bg-orange-500 text-white shadow-md' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Safe exposure */}
      {loading && (
        <div className="bg-white rounded-2xl shadow-md p-6 text-center text-orange-300 text-sm animate-pulse">Calculating...</div>
      )}
      {exposure && !loading && (
        <div className="bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl shadow-lg p-5 text-white">
          <h2 className="text-sm font-semibold opacity-80 mb-4">Safe Exposure — Right Now</h2>
          {exposure.message ? (
            <p className="text-sm opacity-90">{exposure.message}</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div className="bg-white/20 rounded-xl p-3 text-center">
                  <div className="text-3xl font-black">{formatMin(exposure.tan_minutes)}</div>
                  <div className="text-xs opacity-75 mt-1">Optimal tan time</div>
                  <div className="text-[10px] opacity-60">without SPF</div>
                </div>
                <div className="bg-white/20 rounded-xl p-3 text-center">
                  {exposure.all_day_protected ? (
                    <>
                      <div className="text-2xl font-black">All day</div>
                      <div className="text-xs opacity-75 mt-1">Before burning</div>
                      <div className="text-[10px] opacity-60">with SPF {spf}</div>
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-black">{formatMin(exposure.burn_minutes)}</div>
                      <div className="text-xs opacity-75 mt-1">Before burning</div>
                      <div className="text-[10px] opacity-60">with SPF {spf}</div>
                    </>
                  )}
                </div>
              </div>
              {exposure.tan_minutes && (
                <div className="bg-white/10 rounded-xl p-2.5 text-xs opacity-80 text-center">
                  💡 For a full 4-position rotation session, use <strong>{Math.round(exposure.tan_minutes / 4)} min per position</strong>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* 3-day forecast */}
      {uvData?.forecast?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-md p-4">
          <h2 className="text-sm font-semibold text-gray-600 mb-3">UV Forecast</h2>
          <div className="grid grid-cols-3 gap-2">
            {uvData.forecast.map(day => (
              <ForecastCard key={day.date} day={day} />
            ))}
          </div>
        </div>
      )}

      {/* Sun window + chart */}
      {uvData && (
        <div className="bg-white rounded-2xl shadow-md p-4">
          <h2 className="text-sm font-semibold text-gray-600 mb-3">Today's UV Hours</h2>
          <div className="grid grid-cols-3 gap-2 text-center text-sm mb-4">
            <div>
              <div className="text-xs text-gray-400 mb-1">Sunrise</div>
              <div className="font-semibold text-gray-700">{formatTime(uvData.sunrise)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Best tan window</div>
              <div className="font-semibold text-orange-500 text-xs leading-snug">{bestWindow() || 'None today'}</div>
            </div>
            <div>
              <div className="text-xs text-gray-400 mb-1">Sunset</div>
              <div className="font-semibold text-gray-700">{formatTime(uvData.sunset)}</div>
            </div>
          </div>
          {uvData.hourly?.length > 0 && <UVChart data={uvData.hourly} />}
          <div className="flex gap-3 mt-3 text-[9px] text-gray-400 justify-center flex-wrap">
            {UV_META.slice(0, 5).map(m => (
              <span key={m.label} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: m.color }} />
                {m.label}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pro tips */}
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
        <h3 className="text-sm font-semibold text-amber-800 mb-2">Today's Tanning Tips</h3>
        <ul className="text-xs text-amber-700 space-y-2">
          <li>• Sand and water reflect UV — you tan faster near beaches (+25% UV)</li>
          <li>• Clouds can block 20–80% of UV — check the index before going out</li>
          <li>• Early morning and late afternoon sun builds a gentler, longer-lasting base tan</li>
          <li>• Rotating positions every 10–15 min gives the most professional-looking result</li>
        </ul>
      </div>
    </div>
  )
}
