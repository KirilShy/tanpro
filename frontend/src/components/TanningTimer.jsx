import { useState, useEffect, useRef } from 'react'

function fmt(seconds) {
  const m = Math.floor(Math.max(seconds, 0) / 60)
  const s = Math.max(seconds, 0) % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const ROTATION_POSITIONS = [
  { id: 'front', label: 'Front', sub: 'Face up, arms slightly out', emoji: '🙂', bodyClass: 'rotate-0' },
  { id: 'right', label: 'Right Side', sub: 'Lie on right side, arm extended up', emoji: '➡️', bodyClass: '' },
  { id: 'back', label: 'Back', sub: 'Face down, head to one side', emoji: '🔄', bodyClass: '' },
  { id: 'left', label: 'Left Side', sub: 'Lie on left side, arm extended up', emoji: '⬅️', bodyClass: '' },
]

function PositionDiagram({ positionId }) {
  const diagrams = {
    front: (
      <div className="flex flex-col items-center gap-1 text-gray-400 select-none">
        <div className="w-6 h-6 rounded-full border-2 border-orange-400 bg-orange-100 flex items-center justify-center text-sm">😊</div>
        <div className="w-14 h-5 rounded-lg border-2 border-orange-300 bg-orange-50" />
        <div className="flex gap-10">
          <div className="w-3 h-8 rounded-full border-2 border-orange-300 bg-orange-50" />
          <div className="w-3 h-8 rounded-full border-2 border-orange-300 bg-orange-50" />
        </div>
        <div className="flex gap-5">
          <div className="w-4 h-10 rounded-full border-2 border-orange-300 bg-orange-50" />
          <div className="w-4 h-10 rounded-full border-2 border-orange-300 bg-orange-50" />
        </div>
        <div className="text-[9px] mt-1 text-orange-400 font-medium">FACE UP ☀️</div>
      </div>
    ),
    back: (
      <div className="flex flex-col items-center gap-1 text-gray-400 select-none">
        <div className="w-6 h-6 rounded-full border-2 border-gray-300 bg-gray-100 flex items-center justify-center text-sm">🔘</div>
        <div className="w-14 h-5 rounded-lg border-2 border-gray-300 bg-gray-50" />
        <div className="flex gap-10">
          <div className="w-3 h-8 rounded-full border-2 border-gray-300 bg-gray-50" />
          <div className="w-3 h-8 rounded-full border-2 border-gray-300 bg-gray-50" />
        </div>
        <div className="flex gap-5">
          <div className="w-4 h-10 rounded-full border-2 border-gray-300 bg-gray-50" />
          <div className="w-4 h-10 rounded-full border-2 border-gray-300 bg-gray-50" />
        </div>
        <div className="text-[9px] mt-1 text-gray-400 font-medium">FACE DOWN ☀️</div>
      </div>
    ),
    right: (
      <div className="flex flex-col items-center gap-1 select-none">
        <div className="flex items-center gap-2">
          <div className="flex flex-col gap-1 items-end">
            <div className="w-5 h-5 rounded-full border-2 border-orange-300 bg-orange-100" />
            <div className="w-10 h-4 rounded-lg border-2 border-orange-300 bg-orange-50" />
            <div className="w-8 h-8 rounded-lg border-2 border-orange-300 bg-orange-50" />
            <div className="w-9 h-3 rounded-full border-2 border-orange-300 bg-orange-50" />
          </div>
          <div className="text-2xl">➡️</div>
        </div>
        <div className="text-[9px] mt-1 text-orange-400 font-medium">RIGHT SIDE ☀️</div>
      </div>
    ),
    left: (
      <div className="flex flex-col items-center gap-1 select-none">
        <div className="flex items-center gap-2">
          <div className="text-2xl">⬅️</div>
          <div className="flex flex-col gap-1 items-start">
            <div className="w-5 h-5 rounded-full border-2 border-orange-300 bg-orange-100" />
            <div className="w-10 h-4 rounded-lg border-2 border-orange-300 bg-orange-50" />
            <div className="w-8 h-8 rounded-lg border-2 border-orange-300 bg-orange-50" />
            <div className="w-9 h-3 rounded-full border-2 border-orange-300 bg-orange-50" />
          </div>
        </div>
        <div className="text-[9px] mt-1 text-orange-400 font-medium">LEFT SIDE ☀️</div>
      </div>
    ),
  }
  return diagrams[positionId] || null
}

export default function TanningTimer() {
  const [mode, setMode] = useState('setup')
  const [timerMode, setTimerMode] = useState('rotation') // rotation | simple
  const [totalMinutes, setTotalMinutes] = useState(40)
  const [secondsLeft, setSecondsLeft] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [positionIdx, setPositionIdx] = useState(0)
  const [phase, setPhase] = useState('front') // for simple mode
  const [alerts, setAlerts] = useState([])
  const [sessionLog, setSessionLog] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sessionLog') || '[]') } catch { return [] }
  })

  const intervalRef = useRef(null)
  const startRef = useRef(null)
  const pausedRef = useRef(0)
  const totalSecondsRef = useRef(0)

  // Rotation mode: each position gets equal time
  const positionDuration = Math.floor((totalMinutes * 60) / 4)
  const currentPosition = ROTATION_POSITIONS[positionIdx]
  const posElapsed = timerMode === 'rotation' ? elapsed - positionIdx * positionDuration : elapsed
  const posSecondsLeft = timerMode === 'rotation' ? positionDuration - posElapsed : secondsLeft

  const pushAlert = (msg, type = 'info') => {
    const id = Date.now() + Math.random()
    setAlerts(prev => [{ msg, type, id }, ...prev].slice(0, 6))
    if (type === 'info') setTimeout(() => setAlerts(prev => prev.filter(a => a.id !== id)), 10000)
  }

  const tick = () => {
    const newElapsed = Math.floor((Date.now() - startRef.current) / 1000) + pausedRef.current
    const totalSec = totalSecondsRef.current
    const remaining = totalSec - newElapsed

    setElapsed(newElapsed)
    setSecondsLeft(remaining)

    if (timerMode === 'rotation') {
      const newPosIdx = Math.min(Math.floor(newElapsed / positionDuration), 3)
      setPositionIdx(prev => {
        if (newPosIdx > prev && newPosIdx < 4) {
          const next = ROTATION_POSITIONS[newPosIdx]
          pushAlert(`🔄 Rotate to ${next.label} — ${next.sub}`, 'warning')
        }
        return newPosIdx
      })
    } else {
      // Simple mode: flip at halfway
      const half = totalSec / 2
      if (newElapsed >= half && newElapsed < half + 2) {
        setPhase(p => {
          if (p === 'front') { pushAlert('🔄 Time to flip to your back!', 'warning'); return 'back' }
          return p
        })
      }
    }

    if (remaining === 300) pushAlert('⏰ 5 minutes remaining!', 'info')

    if (remaining <= 0) {
      clearInterval(intervalRef.current)
      setMode('done')
      saveSession(newElapsed, totalSec)
      pushAlert('🎉 Session complete! Now get into the shade.', 'danger')
    }
  }

  const start = () => {
    const total = totalMinutes * 60
    totalSecondsRef.current = total
    pausedRef.current = 0
    startRef.current = Date.now()
    setElapsed(0)
    setSecondsLeft(total)
    setPositionIdx(0)
    setPhase('front')
    setAlerts([])
    setMode('running')
    intervalRef.current = setInterval(tick, 500)
    pushAlert(
      timerMode === 'rotation'
        ? `☀️ Session started — ${totalMinutes} min split across 4 positions`
        : `☀️ Session started — ${totalMinutes} min, flip at ${Math.round(totalMinutes / 2)} min`,
      'info'
    )
  }

  const pause = () => {
    clearInterval(intervalRef.current)
    pausedRef.current = elapsed
    setMode('paused')
  }

  const resume = () => {
    startRef.current = Date.now()
    setMode('running')
    intervalRef.current = setInterval(tick, 500)
  }

  const stop = () => {
    clearInterval(intervalRef.current)
    setMode('setup')
    setAlerts([])
  }

  const saveSession = (elapsedSec, totalSec) => {
    const entry = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      planned: Math.round(totalSec / 60),
      actual: Math.round(elapsedSec / 60),
      mode: timerMode,
    }
    const next = [entry, ...sessionLog].slice(0, 10)
    setSessionLog(next)
    localStorage.setItem('sessionLog', JSON.stringify(next))
  }

  useEffect(() => () => clearInterval(intervalRef.current), [])

  const totalSec = totalMinutes * 60
  const overallProgress = totalSec > 0 ? Math.min((elapsed / totalSec) * 100, 100) : 0
  const circumference = 2 * Math.PI * 44

  const alertColors = {
    info: 'bg-blue-50 border-blue-100 text-blue-700',
    warning: 'bg-amber-50 border-amber-100 text-amber-700',
    danger: 'bg-red-50 border-red-100 text-red-700',
  }

  return (
    <div className="space-y-4">
      {/* Setup */}
      {mode === 'setup' && (
        <>
          {/* Mode toggle */}
          <div className="bg-white rounded-2xl shadow-md p-1.5 flex gap-1">
            {[
              { id: 'rotation', label: '4-Position Rotation', sub: 'Front → Right → Back → Left' },
              { id: 'simple', label: 'Simple Timer', sub: 'Front & back only' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setTimerMode(m.id)}
                className={`flex-1 py-2.5 px-2 rounded-xl text-left transition-all ${
                  timerMode === m.id
                    ? 'bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-md'
                    : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                <div className="text-xs font-bold">{m.label}</div>
                <div className={`text-[10px] mt-0.5 ${timerMode === m.id ? 'text-orange-100' : 'text-gray-300'}`}>{m.sub}</div>
              </button>
            ))}
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-sm font-semibold text-gray-600 mb-5">Set Total Session Duration</h2>

            <div className="text-center mb-5">
              <span className="text-6xl font-black text-orange-500">{totalMinutes}</span>
              <span className="text-2xl text-gray-400 ml-2">min</span>
              {timerMode === 'rotation' && (
                <div className="text-xs text-gray-400 mt-2">
                  {Math.round(totalMinutes / 4)} min per position
                </div>
              )}
            </div>

            <input
              type="range" min={16} max={120} step={4}
              value={totalMinutes}
              onChange={e => setTotalMinutes(Number(e.target.value))}
              className="w-full accent-orange-500 mb-5"
            />

            <div className="flex gap-2 flex-wrap mb-5">
              {[20, 28, 40, 60, 80].map(m => (
                <button
                  key={m}
                  onClick={() => setTotalMinutes(m)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    totalMinutes === m ? 'bg-orange-500 text-white shadow' : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                  }`}
                >
                  {m}m
                </button>
              ))}
            </div>

            {timerMode === 'rotation' && (
              <div className="bg-amber-50 rounded-xl p-3 mb-5">
                <div className="text-xs font-semibold text-amber-700 mb-2">Position plan</div>
                <div className="grid grid-cols-4 gap-1">
                  {ROTATION_POSITIONS.map(pos => (
                    <div key={pos.id} className="bg-white rounded-lg p-2 text-center shadow-sm">
                      <div className="text-base">{pos.emoji}</div>
                      <div className="text-[9px] font-medium text-gray-600 leading-tight">{pos.label}</div>
                      <div className="text-[9px] text-orange-500 font-bold mt-0.5">{Math.round(totalMinutes / 4)}m</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {timerMode === 'simple' && (
              <div className="bg-amber-50 rounded-xl p-3 text-xs text-amber-700 mb-5">
                Flip reminder at <strong>{Math.round(totalMinutes / 2)} min</strong>. 5-min warning before end.
              </div>
            )}

            <button
              onClick={start}
              className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-400 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              Start Session ☀️
            </button>
          </div>
        </>
      )}

      {/* Running / Paused / Done */}
      {(mode === 'running' || mode === 'paused' || mode === 'done') && (
        <div className="bg-white rounded-2xl shadow-md p-6">
          {/* Overall circular progress */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <svg width="160" height="160" viewBox="0 0 100 100" className="-rotate-90">
                <circle cx="50" cy="50" r="44" fill="none" stroke="#fed7aa" strokeWidth="7" />
                <circle
                  cx="50" cy="50" r="44" fill="none"
                  stroke={mode === 'done' ? '#22c55e' : mode === 'paused' ? '#9ca3af' : '#f97316'}
                  strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - overallProgress / 100)}
                  style={{ transition: 'stroke-dashoffset 0.5s linear' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                {mode === 'done' ? (
                  <>
                    <div className="text-3xl">✅</div>
                    <div className="text-xs text-gray-400 mt-1">Done!</div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl font-black text-gray-800 leading-none">
                      {fmt(secondsLeft)}
                    </div>
                    <div className="text-[10px] text-gray-400 mt-1">total left</div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Rotation: current position card */}
          {timerMode === 'rotation' && mode !== 'done' && (
            <div className="mb-5">
              <div className="bg-orange-50 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <div className="text-xs text-gray-400 mb-0.5">Current position ({positionIdx + 1}/4)</div>
                    <div className="font-bold text-gray-800 text-lg">{currentPosition.label}</div>
                    <div className="text-xs text-gray-500">{currentPosition.sub}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-orange-500">{fmt(posSecondsLeft)}</div>
                    <div className="text-[10px] text-gray-400">this position</div>
                  </div>
                </div>
                <div className="flex justify-center py-2">
                  <PositionDiagram positionId={currentPosition.id} />
                </div>
                {/* Mini position progress */}
                <div className="flex gap-1.5 mt-3">
                  {ROTATION_POSITIONS.map((pos, i) => (
                    <div
                      key={pos.id}
                      className={`flex-1 h-1.5 rounded-full transition-all ${
                        i < positionIdx ? 'bg-orange-400' :
                        i === positionIdx ? 'bg-orange-300' :
                        'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex gap-1.5 mt-1">
                  {ROTATION_POSITIONS.map((pos, i) => (
                    <div key={pos.id} className="flex-1 text-center text-[8px] text-gray-400">{pos.emoji}</div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Simple mode: phase indicator */}
          {timerMode === 'simple' && mode !== 'done' && (
            <div className="flex gap-2 justify-center mb-5">
              {['front', 'back'].map(p => (
                <div key={p} className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                  phase === p ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'
                }`}>
                  {p === 'front' ? '🙂 Front' : '🔄 Back'}
                </div>
              ))}
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-3 justify-center">
            {mode === 'running' && (
              <>
                {timerMode === 'simple' && (
                  <button
                    onClick={() => setPhase(p => p === 'front' ? 'back' : 'front')}
                    className="px-5 py-2.5 bg-amber-100 text-amber-700 rounded-xl font-medium text-sm"
                  >
                    Flip
                  </button>
                )}
                <button onClick={pause} className="px-5 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium text-sm">
                  Pause
                </button>
                <button onClick={stop} className="px-5 py-2.5 bg-red-100 text-red-600 rounded-xl font-medium text-sm">
                  Stop
                </button>
              </>
            )}
            {mode === 'paused' && (
              <>
                <button onClick={resume} className="px-6 py-2.5 bg-orange-500 text-white rounded-xl font-medium text-sm">
                  Resume
                </button>
                <button onClick={stop} className="px-5 py-2.5 bg-red-100 text-red-600 rounded-xl font-medium text-sm">
                  Cancel
                </button>
              </>
            )}
            {mode === 'done' && (
              <button
                onClick={stop}
                className="px-8 py-3 bg-gradient-to-r from-orange-500 to-amber-400 text-white rounded-xl font-bold shadow"
              >
                New Session
              </button>
            )}
          </div>
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map(a => (
            <div key={a.id} className={`rounded-xl p-3 text-sm border ${alertColors[a.type]}`}>
              {a.msg}
            </div>
          ))}
        </div>
      )}

      {/* Session history */}
      {sessionLog.length > 0 && mode === 'setup' && (
        <div className="bg-white rounded-2xl shadow-md p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-gray-600">Recent Sessions</h2>
            <button
              onClick={() => { setSessionLog([]); localStorage.removeItem('sessionLog') }}
              className="text-xs text-gray-300 hover:text-red-400 transition"
            >
              Clear
            </button>
          </div>
          <div className="space-y-0">
            {sessionLog.slice(0, 5).map((s, i) => (
              <div key={s.id} className={`flex justify-between items-center py-2.5 text-xs ${i < Math.min(sessionLog.length, 5) - 1 ? 'border-b border-gray-50' : ''}`}>
                <div>
                  <span className="font-medium text-gray-700">{s.date}</span>
                  <span className="text-gray-400 ml-2">{s.time}</span>
                  <span className={`ml-2 px-1.5 py-0.5 rounded-md text-[9px] font-medium ${s.mode === 'rotation' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                    {s.mode === 'rotation' ? '4-pos' : 'simple'}
                  </span>
                </div>
                <div className="text-gray-500">{s.actual}/{s.planned} min</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
