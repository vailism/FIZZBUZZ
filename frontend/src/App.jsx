import React, { useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import UploadBox from './components/UploadBox'
import ResultBox from './components/ResultBox'
import StatusBar from './components/StatusBar'

const DEFAULT_API_BASE_URL = window.location.port === '5173'
  ? 'http://127.0.0.1:8000'
  : window.location.origin
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL
const API_KEY = import.meta.env.VITE_API_KEY || ''
const API_URL = `${API_BASE_URL}/predict`
const HISTORY_KEY = 'xray-scan-history-v1'
const MAX_HISTORY_ITEMS = 8

const readStoredHistory = () => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Animated grid background
const GridBg = () => (
  <div className="fixed inset-0 pointer-events-none z-0">
    <div className="absolute inset-0 bg-grid opacity-100"
      style={{
        backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }}
    />
    {/* Radial vignette */}
    <div className="absolute inset-0" style={{
      background: 'radial-gradient(ellipse at center, transparent 40%, #060a14 100%)',
    }} />
    {/* Top glow */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px"
      style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.4), transparent)' }} />
  </div>
)

// System header top bar
const TopBar = () => (
  <div className="flex items-center justify-between px-6 py-3 border-b"
    style={{ borderColor: '#1a2540', background: 'rgba(6,10,20,0.9)' }}>
    <div className="flex items-center gap-3">
      <div className="flex gap-1.5">
        <div className="w-2 h-2 rounded-full" style={{ background: '#ff2d55' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: '#ff9f00' }} />
        <div className="w-2 h-2 rounded-full" style={{ background: '#00ff88' }} />
      </div>
      <span className="font-mono text-xs text-muted hidden sm:block">SECURE TERMINAL v4.2.1</span>
    </div>
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-1.5">
        <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: '#00ff88' }} />
        <span className="font-mono text-xs text-muted">SYS ONLINE</span>
      </div>
      <div className="hidden sm:flex items-center gap-1.5 font-mono text-xs text-muted">
        <span style={{ color: '#3a4a6b' }}>UID:</span>
        <span>SEC-7734</span>
      </div>
    </div>
  </div>
)

export default function App() {
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [scanHistory, setScanHistory] = useState(readStoredHistory)

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(scanHistory))
  }, [scanHistory])

  const handleImageChange = useCallback((file, preview) => {
    setImageFile(file)
    setImagePreview(preview)
    setResult(null)
    setError('')
  }, [])

  const handleClear = useCallback(() => {
    setImageFile(null)
    setImagePreview(null)
    setResult(null)
    setError('')
    setScanHistory([])
  }, [])

  const handleAnalyze = async () => {
    if (!imageFile) return
    setIsLoading(true)
    setError('')
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', imageFile)

      const res = await axios.post(API_URL, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(API_KEY ? { 'x-api-key': API_KEY } : {}),
        },
        timeout: 30000,
      })

      setResult(res.data)

      const topDetection = res.data?.detections?.[0]
      const item = {
        id: Date.now(),
        at: new Date().toLocaleTimeString(),
        status: res.data?.status || 'UNKNOWN',
        topClass: topDetection?.class || 'none',
        confidence: topDetection?.confidence || 0,
      }
      setScanHistory(prev => [item, ...prev].slice(0, MAX_HISTORY_ITEMS))
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Backend may be overloaded.')
      } else if (err.response) {
        setError(`Server error: ${err.response.status} — ${err.response.data?.detail || 'Unknown error'}`)
      } else if (err.request) {
        setError('Cannot reach backend at localhost:8000. Is the server running?')
      } else {
        setError(`Unexpected error: ${err.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isThreat = result?.status === 'THREAT'

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#060a14' }}>
      <GridBg />
      <TopBar />

      {/* Main content */}
      <main className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 gap-8">

        {/* Title section */}
        <div className="text-center space-y-3 animate-fade-in">
          {/* Top label */}
          <div className="flex items-center justify-center gap-3">
            <div className="h-px flex-1 max-w-16" style={{ background: 'linear-gradient(90deg, transparent, #1a2540)' }} />
            <span className="font-mono text-xs tracking-widest" style={{ color: '#3a4a6b' }}>
              ◈ CLASSIFIED SYSTEM ◈
            </span>
            <div className="h-px flex-1 max-w-16" style={{ background: 'linear-gradient(90deg, #1a2540, transparent)' }} />
          </div>

          {/* Main title */}
          <div className="relative inline-block">
            <h1 className="font-display font-black text-2xl sm:text-3xl lg:text-4xl tracking-wider"
              style={{
                background: 'linear-gradient(135deg, #e2e8f0 30%, #00d4ff 70%, #e2e8f0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '0.05em',
              }}>
              AI-Powered X-Ray Threat Detection
            </h1>
            {/* Underline glow */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3/4 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.5), transparent)' }} />
          </div>

          <p className="font-body text-sm text-muted max-w-xl mx-auto">
            Upload X-ray imagery for real-time AI-driven threat identification and classification
          </p>
        </div>

        {/* Main panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left panel - Upload */}
          <div className="glass rounded-2xl p-5 relative" style={{ border: '1px solid #1a2540' }}>
            {/* Corner marks */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-xl"
              style={{ borderColor: '#00d4ff55' }} />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr-xl"
              style={{ borderColor: '#00d4ff55' }} />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl-xl"
              style={{ borderColor: '#00d4ff55' }} />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-xl"
              style={{ borderColor: '#00d4ff55' }} />

            <UploadBox
              image={imagePreview}
              onImageChange={handleImageChange}
              onClear={handleClear}
            />
          </div>

          {/* Right panel - Result */}
          <div
            className={`glass rounded-2xl p-5 relative transition-all duration-700 ${
              isThreat ? 'threat-active' : result?.status === 'SAFE' ? 'safe-active' : ''
            }`}
            style={{ border: '1px solid #1a2540' }}
          >
            {/* Corner marks */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 rounded-tl-xl"
              style={{ borderColor: isThreat ? '#ff2d5555' : result?.status === 'SAFE' ? '#00ff8855' : '#00d4ff55' }} />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 rounded-tr-xl"
              style={{ borderColor: isThreat ? '#ff2d5555' : result?.status === 'SAFE' ? '#00ff8855' : '#00d4ff55' }} />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 rounded-bl-xl"
              style={{ borderColor: isThreat ? '#ff2d5555' : result?.status === 'SAFE' ? '#00ff8855' : '#00d4ff55' }} />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 rounded-br-xl"
              style={{ borderColor: isThreat ? '#ff2d5555' : result?.status === 'SAFE' ? '#00ff8855' : '#00d4ff55' }} />

            <ResultBox
              resultImage={result?.output_image_path}
              detections={result?.detections}
              status={result?.status}
              isLoading={isLoading}
            />
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="animate-slide-up flex items-start gap-3 px-4 py-3 rounded-xl"
            style={{ background: 'rgba(255,45,85,0.08)', border: '1px solid rgba(255,45,85,0.3)' }}>
            <span className="text-threat text-sm mt-0.5 flex-shrink-0">⚠</span>
            <div>
              <p className="font-mono text-xs font-bold text-threat mb-0.5">CONNECTION ERROR</p>
              <p className="font-mono text-xs text-threat/80">{error}</p>
            </div>
          </div>
        )}

        {/* Status bar */}
        <StatusBar
          status={result?.status}
          isLoading={isLoading}
          detections={result?.detections}
        />

        {/* Scan history */}
        <div className="glass rounded-2xl p-4" style={{ border: '1px solid #1a2540' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full" style={{ background: '#00d4ff' }} />
            <span className="font-mono text-xs text-muted tracking-widest uppercase">Recent Scans</span>
            <div className="flex-1 h-px" style={{ background: '#1a2540' }} />
          </div>

          {scanHistory.length === 0 ? (
            <p className="font-mono text-xs" style={{ color: '#3a4a6b' }}>No scans yet in this browser session.</p>
          ) : (
            <div className="space-y-2">
              {scanHistory.map(item => (
                <div key={item.id} className="flex items-center justify-between px-3 py-2 rounded-lg"
                  style={{ background: 'rgba(10,14,26,0.6)', border: '1px solid #1a2540' }}>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs" style={{ color: '#6b82a6', minWidth: '70px' }}>{item.at}</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded"
                      style={{
                        color: item.status === 'THREAT' ? '#ff2d55' : '#00ff88',
                        background: item.status === 'THREAT' ? 'rgba(255,45,85,0.12)' : 'rgba(0,255,136,0.12)',
                        border: item.status === 'THREAT' ? '1px solid rgba(255,45,85,0.3)' : '1px solid rgba(0,255,136,0.3)',
                      }}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs" style={{ color: '#4a6a8a' }}>{item.topClass}</span>
                    <span className="font-mono text-xs" style={{ color: '#ff9f00' }}>
                      {Math.round((item.confidence || 0) * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleAnalyze}
            disabled={!imageFile || isLoading}
            className={`btn-primary relative flex items-center justify-center gap-3 px-10 py-4 rounded-xl font-display font-bold tracking-widest text-sm transition-all duration-300
              ${imageFile && !isLoading
                ? 'hover:scale-[1.02] hover:shadow-lg cursor-pointer'
                : 'opacity-40 cursor-not-allowed'
              }`}
            style={{
              background: imageFile && !isLoading
                ? 'linear-gradient(135deg, #0f2a4a, #0a1e3a)'
                : 'rgba(26,37,64,0.4)',
              border: imageFile && !isLoading
                ? '1px solid rgba(0,212,255,0.5)'
                : '1px solid #1a2540',
              color: imageFile && !isLoading ? '#00d4ff' : '#3a4a6b',
              boxShadow: imageFile && !isLoading
                ? '0 0 20px rgba(0,212,255,0.15), inset 0 0 20px rgba(0,212,255,0.03)'
                : 'none',
            }}
          >
            {isLoading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" className="spinner-ring">
                  <circle cx="8" cy="8" r="6" fill="none" stroke="#00d4ff44" strokeWidth="2" />
                  <circle cx="8" cy="8" r="6" fill="none" stroke="#00d4ff" strokeWidth="2"
                    strokeLinecap="round" strokeDasharray="37" strokeDashoffset="28"
                  />
                </svg>
                ANALYZING...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 8 C2 4.7 4.7 2 8 2 C11.3 2 14 4.7 14 8 C14 11.3 11.3 14 8 14"
                    stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <circle cx="8" cy="8" r="2.5" fill="currentColor" />
                  <path d="M8 14 L6 11.5 L10 11.5 Z" fill="currentColor" />
                </svg>
                RUN ANALYSIS
              </>
            )}
          </button>

          <button
            onClick={handleClear}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-display font-bold tracking-widest text-sm transition-all duration-300 hover:scale-[1.01] cursor-pointer"
            style={{
              background: 'rgba(255,45,85,0.05)',
              border: '1px solid rgba(255,45,85,0.2)',
              color: '#6b82a6',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.color = '#ff2d55'
              e.currentTarget.style.borderColor = 'rgba(255,45,85,0.5)'
              e.currentTarget.style.background = 'rgba(255,45,85,0.08)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.color = '#6b82a6'
              e.currentTarget.style.borderColor = 'rgba(255,45,85,0.2)'
              e.currentTarget.style.background = 'rgba(255,45,85,0.05)'
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            CLEAR SESSION
          </button>
        </div>

        {/* Footer info strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 py-3 border-t"
          style={{ borderColor: '#1a2540' }}>
          {[
            { label: 'MODEL', value: 'YOLOv8-SEC' },
            { label: 'ACCURACY', value: '97.4%' },
            { label: 'LATENCY', value: '<200ms' },
            { label: 'CLASSES', value: '12 THREATS' },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <span className="font-mono text-xs" style={{ color: '#2a3a5a' }}>{label}</span>
              <span className="font-mono text-xs font-bold" style={{ color: '#4a6a8a' }}>{value}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
