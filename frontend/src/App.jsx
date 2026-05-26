import { useState, useEffect } from 'react'
import SkinTypeSetup from './components/SkinTypeSetup'
import TanningGuide from './components/TanningGuide'
import Dashboard from './components/Dashboard'
import TanningTimer from './components/TanningTimer'
import SPFTracker from './components/SPFTracker'

const UV_CATEGORIES = [
  { max: 2, label: 'Low', bg: 'bg-green-400' },
  { max: 5, label: 'Moderate', bg: 'bg-yellow-400' },
  { max: 7, label: 'High', bg: 'bg-orange-400' },
  { max: 10, label: 'Very High', bg: 'bg-red-500' },
  { max: Infinity, label: 'Extreme', bg: 'bg-purple-600' },
]

function getUVInfo(uv) {
  return UV_CATEGORIES.find(c => uv <= c.max)
}

const TABS = [
  { id: 'guide', icon: '📋', label: 'Guide' },
  { id: 'dashboard', icon: '🌤️', label: 'Dashboard' },
  { id: 'session', icon: '⏱️', label: 'Session' },
  { id: 'spf', icon: '🧴', label: 'SPF' },
]

export default function App() {
  const [skinProfile, setSkinProfile] = useState(() => {
    try {
      const saved = localStorage.getItem('skinProfile')
      return saved ? JSON.parse(saved) : null
    } catch { return null }
  })
  const [uvData, setUvData] = useState(null)
  const [location, setLocation] = useState(null)
  const [locationError, setLocationError] = useState(null)
  const [activeTab, setActiveTab] = useState('guide')
  const [uvLoading, setUvLoading] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => setLocationError('Location access denied — allow location for live UV data')
    )
  }, [])

  useEffect(() => {
    if (!location) return
    setUvLoading(true)
    fetch(`/api/uv?lat=${location.lat}&lng=${location.lng}`)
      .then(r => r.json())
      .then(data => { setUvData(data); setUvLoading(false) })
      .catch(() => setUvLoading(false))
  }, [location])

  const saveSkinProfile = (profile) => {
    setSkinProfile(profile)
    localStorage.setItem('skinProfile', JSON.stringify(profile))
  }

  if (!skinProfile) return <SkinTypeSetup onComplete={saveSkinProfile} />

  const uvInfo = uvData ? getUVInfo(uvData.current_uv) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-lg">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">TanPro</h1>
            <p className="text-orange-100 text-xs">Professional Tanning Assistant</p>
          </div>
          <button
            onClick={() => { setSkinProfile(null); localStorage.removeItem('skinProfile') }}
            className="text-orange-100 text-xs border border-orange-300/50 rounded-lg px-2 py-1 hover:bg-orange-400/50 transition"
          >
            Reset
          </button>
        </div>
      </header>

      {/* UV Banner */}
      <div className="max-w-lg mx-auto px-4 pt-4">
        {uvLoading && (
          <div className="bg-white rounded-2xl shadow p-3 text-center text-orange-300 text-xs animate-pulse">
            Fetching live UV data...
          </div>
        )}
        {uvData && !uvLoading && (
          <div className="bg-white rounded-2xl shadow-md p-3.5 flex items-center gap-4">
            <div className="text-center min-w-[52px]">
              <div className="text-4xl font-black text-orange-500 leading-none">{uvData.current_uv}</div>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-1">UV Now</div>
            </div>
            <div className="flex-1">
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${uvInfo?.bg}`}
                  style={{ width: `${Math.min((uvData.current_uv / 12) * 100, 100)}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1.5">
                Max today: <span className="font-semibold text-orange-500">{uvData.max_uv}</span>
                {uvData.best_hours?.length > 0 && (
                  <span className="ml-2">· Best tan hours available</span>
                )}
              </div>
            </div>
          </div>
        )}
        {locationError && !uvData && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-3 text-orange-600 text-xs">
            {locationError}
          </div>
        )}
      </div>

      {/* Tab Content */}
      <main className="max-w-lg mx-auto px-4 pt-4 pb-24">
        {activeTab === 'guide' && <TanningGuide onNavigate={setActiveTab} />}
        {activeTab === 'dashboard' && <Dashboard uvData={uvData} skinProfile={skinProfile} />}
        {activeTab === 'session' && <TanningTimer uvData={uvData} skinProfile={skinProfile} />}
        {activeTab === 'spf' && <SPFTracker />}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 shadow-2xl">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors relative ${
                activeTab === tab.id ? 'text-orange-500' : 'text-gray-400 hover:text-gray-500'
              }`}
            >
              {activeTab === tab.id && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-orange-400 rounded-full" />
              )}
              <span className="text-lg leading-tight">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
