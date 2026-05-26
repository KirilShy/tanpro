import { useState } from 'react'

const SKIN_TYPES = [
  { type: 1, typeName: 'Type I', description: 'Always burns, never tans', example: 'Pale white, freckles, red/blonde hair', color: '#FFDFC4' },
  { type: 2, typeName: 'Type II', description: 'Usually burns, tans minimally', example: 'Fair white skin, blue/green eyes', color: '#F0C8A0' },
  { type: 3, typeName: 'Type III', description: 'Sometimes burns, tans well', example: 'White to light beige skin', color: '#D4A070' },
  { type: 4, typeName: 'Type IV', description: 'Rarely burns, always tans', example: 'Light brown / olive skin', color: '#B87850' },
  { type: 5, typeName: 'Type V', description: 'Very rarely burns, tans deeply', example: 'Brown skin', color: '#8D5524' },
  { type: 6, typeName: 'Type VI', description: 'Almost never burns', example: 'Dark brown to black skin', color: '#4A2912' },
]

export default function SkinTypeSetup({ onComplete }) {
  const [selected, setSelected] = useState(null)

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
      <div className="max-w-lg mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">☀️</div>
          <h1 className="text-3xl font-black text-gray-800">Welcome to TanPro</h1>
          <p className="text-gray-500 mt-2 text-sm leading-relaxed">
            Select your Fitzpatrick skin type to get personalized,<br />
            science-based tanning guidance every day.
          </p>
        </div>

        <div className="space-y-3">
          {SKIN_TYPES.map(st => (
            <button
              key={st.type}
              onClick={() => setSelected(st)}
              className={`w-full text-left rounded-2xl p-4 flex items-center gap-4 transition-all ${
                selected?.type === st.type
                  ? 'ring-2 ring-orange-400 bg-orange-50 shadow-lg'
                  : 'bg-white shadow hover:shadow-md hover:bg-orange-50/50'
              }`}
            >
              <div
                className="w-12 h-12 rounded-full flex-shrink-0 border-2 border-white shadow-inner"
                style={{ backgroundColor: st.color }}
              />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-gray-800">{st.typeName}</div>
                <div className="text-sm text-gray-600">{st.description}</div>
                <div className="text-xs text-gray-400 mt-0.5 truncate">{st.example}</div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-all ${
                selected?.type === st.type
                  ? 'border-orange-400 bg-orange-400'
                  : 'border-gray-300'
              }`}>
                {selected?.type === st.type && (
                  <span className="text-white text-xs flex items-center justify-center h-full">✓</span>
                )}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={() => selected && onComplete(selected)}
          disabled={!selected}
          className={`w-full mt-6 py-4 rounded-2xl font-bold text-lg transition-all ${
            selected
              ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-white shadow-lg hover:shadow-xl active:scale-95'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {selected ? `Continue as ${selected.typeName}` : 'Select your skin type'}
        </button>

        <p className="text-xs text-gray-400 text-center mt-3">
          You can reset this any time from the app header.
        </p>
      </div>
    </div>
  )
}
