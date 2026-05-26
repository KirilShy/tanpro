import { useState, useEffect } from 'react'

const todayKey = () => new Date().toISOString().slice(0, 10)

const PRE_SECTIONS = [
  {
    title: '1–2 Days Before',
    color: 'amber',
    items: [
      { id: 'exfoliate', label: 'Exfoliate your whole body', tip: 'Dead skin cells cause patchy, uneven tans. Use a body scrub or exfoliating mitt in the shower.' },
      { id: 'remove_old', label: 'Remove old fake tan or bronzer', tip: 'Old product sitting on skin will block fresh UV absorption and look patchy.' },
      { id: 'no_wax', label: 'No waxing or shaving today', tip: 'Freshly waxed or shaved skin is irritated and tans unevenly. Wait 24h after.' },
    ],
  },
  {
    title: 'Day Of — Before Going Out',
    color: 'orange',
    items: [
      { id: 'dry_areas', label: 'Moisturize dry areas first', tip: 'Knees, elbows, ankles, and wrists are naturally drier and absorb more pigment — moisturize to prevent dark patches.' },
      { id: 'spf_apply', label: 'Apply SPF 15–30 min before sun', tip: 'SPF needs time to form a protective film on the skin. Applying at the beach is too late.' },
      { id: 'hydrate_pre', label: 'Drink at least 500ml of water', tip: 'Hydrated skin tans more evenly and recovers faster. Dehydration makes tan fade faster too.' },
      { id: 'hair_jewelry', label: 'Tie up hair, remove jewelry', tip: 'Jewelry creates tan lines and pressure marks. Hair on your neck blocks UV.' },
      { id: 'accelerator', label: 'Apply tan accelerator (optional)', tip: 'Accelerators contain tyrosine and botanical extracts that stimulate melanin production for faster, deeper color.' },
    ],
  },
]

const SESSION_SECTIONS = [
  {
    title: 'Positioning & Rotation',
    color: 'orange',
    items: [
      { id: 'check_uv', label: 'Check UV index before starting', tip: 'UV 3–5 is ideal for a gradual, deep tan. UV 6–8 requires shorter sessions. UV 9+ is high risk.' },
      { id: 'pos_front', label: 'Position 1 — Front (face up)', tip: 'Start on your back facing the sun. Arms slightly away from body, legs uncrossed for even coverage.' },
      { id: 'pos_right', label: 'Position 2 — Right side', tip: 'Lie on your right side. Extend your arm up to avoid a white underarm strip.' },
      { id: 'pos_back', label: 'Position 3 — Back (face down)', tip: 'Face down. Turn head to one side, arms relaxed. This side often gets the least attention — don\'t skip it.' },
      { id: 'pos_left', label: 'Position 4 — Left side', tip: 'Lie on your left side. Mirror the right side position. Complete the full rotation.' },
    ],
  },
  {
    title: 'During the Session',
    color: 'amber',
    items: [
      { id: 'shade_breaks', label: 'Take a shade break every 30–40 min', tip: 'Resting in the shade lets skin cool and recover. Continuous exposure increases burn risk without speeding the tan.' },
      { id: 'reapply_spf', label: 'Reapply SPF every 90–120 min', tip: 'UV breaks down sunscreen molecules. Reapplication is non-negotiable — even water-resistant SPF needs topping up.' },
      { id: 'hydrate_session', label: 'Drink water every 30 min', tip: 'You lose significant water through sweat in the sun. Dehydration shows immediately in skin texture and tan quality.' },
      { id: 'no_phone_face', label: 'Keep phone off your face', tip: 'Holding your phone over your face blocks UV and creates an odd, uneven jawline tan.' },
    ],
  },
]

const AFTER_SECTIONS = [
  {
    title: 'Immediately After',
    color: 'blue',
    items: [
      { id: 'wait_shower', label: 'Wait 30–60 min before showering', tip: 'The tan continues to develop after you leave the sun. Showering immediately stops the process early.' },
      { id: 'cool_shower', label: 'Shower with cool or lukewarm water', tip: 'Hot water opens pores, strips natural oils, and actively fades your fresh tan. Use cool water only.' },
      { id: 'gentle_wash', label: 'Use a gentle, sulfate-free wash', tip: 'Harsh soaps strip your tan. A mild, creamy body wash preserves skin oils and tan color.' },
      { id: 'pat_dry', label: 'Pat dry — never rub', tip: 'Rubbing with a towel removes surface tan cells and causes patchiness. Pat gently and let skin air-dry a bit.' },
    ],
  },
  {
    title: 'Skin Recovery',
    color: 'green',
    items: [
      { id: 'after_sun', label: 'Apply after-sun lotion or aloe vera', tip: 'After-sun products contain cooling agents and antioxidants that repair UV damage and reduce redness. Apply while skin is still slightly damp.' },
      { id: 'moisturize_after', label: 'Moisturize generously', tip: 'A well-hydrated skin holds color 2–3× longer. Use a thick body butter or lotion with shea or cocoa butter.' },
      { id: 'no_exfoliate_after', label: 'Avoid exfoliation for 48 hours', tip: 'The tan is sitting in the top layer of skin cells. Exfoliating will strip it before it has time to set properly.' },
      { id: 'stay_hydrated', label: 'Keep drinking water throughout the day', tip: 'Sun exposure depletes hydration for hours. Keeping up fluid intake helps skin recovery and tan longevity.' },
    ],
  },
]

const PHASE_CONFIG = {
  pre: { label: 'Pre-Tan', icon: '🌅', sections: PRE_SECTIONS, next: 'session', nextLabel: 'Go to Session guide →' },
  session: { label: 'Session', icon: '☀️', sections: SESSION_SECTIONS, next: 'after', nextLabel: 'Go to After-Sun guide →' },
  after: { label: 'After-Sun', icon: '🌙', sections: AFTER_SECTIONS, next: null },
}

const colorMap = {
  amber: { bg: 'bg-amber-50', border: 'border-amber-200', title: 'text-amber-700', dot: 'bg-amber-400' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-200', title: 'text-orange-700', dot: 'bg-orange-400' },
  blue: { bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-700', dot: 'bg-blue-400' },
  green: { bg: 'bg-green-50', border: 'border-green-200', title: 'text-green-700', dot: 'bg-green-500' },
}

export default function TanningGuide({ onNavigate }) {
  const [phase, setPhase] = useState('pre')
  const [checked, setChecked] = useState(() => {
    try {
      const saved = localStorage.getItem(`guide-${todayKey()}`)
      return saved ? JSON.parse(saved) : {}
    } catch { return {} }
  })
  const [expanded, setExpanded] = useState(null)

  const saveChecked = (next) => {
    setChecked(next)
    localStorage.setItem(`guide-${todayKey()}`, JSON.stringify(next))
  }

  const toggle = (id) => {
    saveChecked({ ...checked, [id]: !checked[id] })
  }

  const config = PHASE_CONFIG[phase]
  const allItems = config.sections.flatMap(s => s.items)
  const doneCount = allItems.filter(item => checked[item.id]).length
  const totalCount = allItems.length
  const progress = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const resetPhase = () => {
    const ids = allItems.map(i => i.id)
    const next = { ...checked }
    ids.forEach(id => delete next[id])
    saveChecked(next)
  }

  return (
    <div className="space-y-4">
      {/* Phase selector */}
      <div className="bg-white rounded-2xl shadow-md p-1.5 flex gap-1">
        {Object.entries(PHASE_CONFIG).map(([key, val]) => (
          <button
            key={key}
            onClick={() => setPhase(key)}
            className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center gap-0.5 ${
              phase === key
                ? 'bg-gradient-to-br from-orange-500 to-amber-400 text-white shadow-md'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            <span className="text-base">{val.icon}</span>
            {val.label}
          </button>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-semibold text-gray-700">{config.label} Checklist</span>
          <span className="text-xs text-gray-400">{doneCount}/{totalCount} done</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        {doneCount > 0 && (
          <button onClick={resetPhase} className="text-xs text-gray-300 hover:text-gray-400 mt-2 transition">
            Reset this phase
          </button>
        )}
      </div>

      {/* Sections */}
      {config.sections.map(section => {
        const c = colorMap[section.color]
        return (
          <div key={section.title} className={`rounded-2xl border ${c.border} ${c.bg} overflow-hidden`}>
            <div className="px-4 py-3 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${c.dot}`} />
              <span className={`text-sm font-bold ${c.title}`}>{section.title}</span>
            </div>
            <div className="bg-white mx-2 mb-2 rounded-xl overflow-hidden shadow-sm">
              {section.items.map((item, idx) => (
                <div key={item.id}>
                  <div
                    className="flex items-start gap-3 p-3 cursor-pointer hover:bg-gray-50 transition"
                    onClick={() => toggle(item.id)}
                  >
                    <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-all ${
                      checked[item.id]
                        ? 'border-orange-400 bg-orange-400'
                        : 'border-gray-300'
                    }`}>
                      {checked[item.id] && <span className="text-white text-[10px] font-bold">✓</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium leading-snug ${
                        checked[item.id] ? 'line-through text-gray-400' : 'text-gray-700'
                      }`}>
                        {item.label}
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setExpanded(expanded === item.id ? null : item.id) }}
                      className="text-gray-300 hover:text-orange-400 transition flex-shrink-0 text-sm mt-0.5"
                    >
                      {expanded === item.id ? '▲' : '▼'}
                    </button>
                  </div>
                  {expanded === item.id && (
                    <div className="px-4 pb-3 pt-0">
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-700 leading-relaxed ml-8">
                        💡 {item.tip}
                      </div>
                    </div>
                  )}
                  {idx < section.items.length - 1 && <div className="border-b border-gray-50 mx-3" />}
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* Completion banner */}
      {progress === 100 && (
        <div className="bg-gradient-to-br from-orange-500 to-amber-400 rounded-2xl p-4 text-white text-center shadow-lg">
          <div className="text-2xl mb-1">
            {phase === 'pre' ? '🌅' : phase === 'session' ? '☀️' : '✨'}
          </div>
          <div className="font-bold">
            {phase === 'pre' ? 'Ready to tan!' : phase === 'session' ? 'Great session!' : 'Perfect recovery!'}
          </div>
          <div className="text-orange-100 text-xs mt-1">
            {phase === 'pre' ? 'All prep done. Head to the Session tab to start.' : phase === 'session' ? 'Now take care of your skin.' : 'Your tan will look amazing tomorrow.'}
          </div>
        </div>
      )}

      {/* Next phase button */}
      {config.next && (
        <button
          onClick={() => setPhase(config.next)}
          className="w-full py-3 bg-white border border-orange-200 text-orange-500 rounded-2xl text-sm font-semibold hover:bg-orange-50 transition shadow-sm"
        >
          {config.nextLabel}
        </button>
      )}

      {/* Quick tips panel */}
      <div className="bg-white rounded-2xl shadow-md p-4">
        <h3 className="text-sm font-semibold text-gray-600 mb-3">
          {phase === 'pre' ? 'Pre-Tan Products' : phase === 'session' ? 'Session Essentials' : 'After-Sun Must-Haves'}
        </h3>
        {phase === 'pre' && (
          <ul className="text-xs text-gray-500 space-y-2">
            <li className="flex gap-2"><span>🧴</span><span><strong>SPF 30+</strong> — minimum for any skin type. Reapply every 90 min.</span></li>
            <li className="flex gap-2"><span>🫒</span><span><strong>Tan accelerator</strong> — look for tyrosine, carrot oil, or walnut extract.</span></li>
            <li className="flex gap-2"><span>🧼</span><span><strong>Exfoliating scrub</strong> — coffee or sugar scrubs work great the day before.</span></li>
            <li className="flex gap-2"><span>💧</span><span><strong>Hydrating lotion</strong> — apply to knees/elbows to prevent dark patches.</span></li>
          </ul>
        )}
        {phase === 'session' && (
          <ul className="text-xs text-gray-500 space-y-2">
            <li className="flex gap-2"><span>🕶️</span><span><strong>UV-rated sunglasses</strong> — UV damages eyes even when it doesn't burn skin.</span></li>
            <li className="flex gap-2"><span>💦</span><span><strong>Water bottle</strong> — at least 1L for a 60-min session in the sun.</span></li>
            <li className="flex gap-2"><span>🧴</span><span><strong>Extra SPF</strong> — bring the bottle to reapply on time.</span></li>
            <li className="flex gap-2"><span>🏖️</span><span><strong>Towel or mat</strong> — reflective surfaces (sand, water) increase UV by up to 25%.</span></li>
          </ul>
        )}
        {phase === 'after' && (
          <ul className="text-xs text-gray-500 space-y-2">
            <li className="flex gap-2"><span>🌿</span><span><strong>Aloe vera gel</strong> — best immediate treatment for any redness or heat.</span></li>
            <li className="flex gap-2"><span>🧴</span><span><strong>After-sun lotion</strong> — choose one with vitamin E and hyaluronic acid.</span></li>
            <li className="flex gap-2"><span>🫧</span><span><strong>Body butter</strong> — shea or cocoa butter locks in color and smooths skin.</span></li>
            <li className="flex gap-2"><span>💊</span><span><strong>Vitamin C</strong> — antioxidants taken after sun exposure help repair UV damage.</span></li>
          </ul>
        )}
      </div>
    </div>
  )
}
