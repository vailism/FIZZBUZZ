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
const THEME_KEY = 'xray-theme-v1'
const MAX_HISTORY_ITEMS = 8

const readStoredTheme = () => {
  try {
    const raw = localStorage.getItem(THEME_KEY)
    return raw === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

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

export default function App() {
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [scanHistory, setScanHistory] = useState(readStoredHistory)
  const [isBooting, setIsBooting] = useState(true)
  const [theme, setTheme] = useState(readStoredTheme)
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement))
  const [posterMode, setPosterMode] = useState(false)
  const [typedLine, setTypedLine] = useState('')

  const heroLine = 'An out-of-the-world AI defense interface built to command attention during live demos.'

  useEffect(() => {
    const timer = window.setTimeout(() => setIsBooting(false), 2600)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    let idx = 0
    setTypedLine('')
    const timer = window.setInterval(() => {
      idx += 1
      setTypedLine(heroLine.slice(0, idx))
      if (idx >= heroLine.length) {
        window.clearInterval(timer)
      }
    }, 14)

    return () => window.clearInterval(timer)
  }, [heroLine])

  useEffect(() => {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(scanHistory))
  }, [scanHistory])

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', onFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange)
  }, [])

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
      } else {
        await document.exitFullscreen()
      }
    } catch {
      setError('Fullscreen mode is not available in this browser context.')
    }
  }

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
        setError(`Server error: ${err.response.status} - ${err.response.data?.detail || 'Unknown error'}`)
      } else if (err.request) {
        setError('Cannot reach backend. Confirm the server is running.')
      } else {
        setError(`Unexpected error: ${err.message}`)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const isThreat = result?.status === 'THREAT'
  const latest = scanHistory[0]

  return (
    <div className={`app-shell ${posterMode ? 'poster-mode' : ''} ${theme === 'light' ? 'light-mode' : 'dark-mode'}`}>
      {isBooting && (
        <div className="lux-loader" onClick={() => setIsBooting(false)}>
          <div className="lux-loader-noise" />
          <div className="lux-loader-center">
            <img src="/logo-citadel.svg" alt="Citadel logo" className="lux-loader-logo" />
            <p className="lux-loader-brand">CITADEL</p>
            <div className="lux-loader-track" aria-hidden="true">
              <span />
            </div>
            <p className="lux-loader-sub">Intelligence suite initializing</p>
          </div>
        </div>
      )}

      <div className="orb orb-one" />
      <div className="orb orb-two" />
      <div className="mesh-grid" />

      <header className="top-nav">
        <div className="brand-wrap">
          <img src="/favicon.svg" alt="Citadel mark" className="brand-logo" />
          <p className="brand-title">CITADEL SECURITY LAB</p>
        </div>
        <div className="pill-row">
          <span className="status-pill">YOLOv8 ACTIVE</span>
          <span className="status-pill">LIVE ANALYSIS</span>
          <button className="present-btn" type="button" onClick={() => setTheme(prev => (prev === 'dark' ? 'light' : 'dark'))}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button className="present-btn theme-btn" type="button" onClick={() => setPosterMode(prev => !prev)}>
            {posterMode ? 'Back to Neon' : 'Screenshot Mode'}
          </button>
          <button className="present-btn" type="button" onClick={toggleFullscreen}>
            {isFullscreen ? 'Exit Present Mode' : 'Present Mode'}
          </button>
        </div>
      </header>

      <main className="main-wrap">
        <section className="hero-block reveal-up">
          <p className="hero-kicker">AEROSCAN SUITE</p>
          <h1 className="hero-title">X-ray Threat Intelligence Console</h1>
          <p className="hero-copy">{typedLine}<span className="typing-caret">|</span></p>
          <div className="hero-bars" aria-hidden="true">
            <span />
            <span />
            <span />
            <span />
            <span />
          </div>
        </section>

        <section className="panel-grid">
          <article className="neo-card card-upload reveal-up delay-1">
            <UploadBox image={imagePreview} onImageChange={handleImageChange} onClear={handleClear} />
          </article>

          <article className={`neo-card card-result reveal-up delay-2 ${isThreat ? 'card-danger' : result?.status === 'SAFE' ? 'card-safe' : ''}`}>
            <ResultBox
              inputImage={imagePreview}
              resultImage={result?.output_image_path}
              detections={result?.detections}
              status={result?.status}
              isLoading={isLoading}
            />
          </article>
        </section>

        {error && (
          <div className="error-banner reveal-up">
            <span className="error-label">Connection error</span>
            <p>{error}</p>
          </div>
        )}

        <StatusBar status={result?.status} isLoading={isLoading} detections={result?.detections} />

        <section className="panel-grid-lower">
          <article className="neo-card history-card reveal-up delay-1">
            <div className="history-header">
              <h2>Recent Scans</h2>
              <span>{scanHistory.length} records</span>
            </div>

            {scanHistory.length === 0 ? (
              <p className="history-empty">No scans recorded yet in this browser.</p>
            ) : (
              <div className="history-list">
                {scanHistory.map(item => (
                  <div key={item.id} className="history-item">
                    <div className="history-left">
                      <p className="history-time">{item.at}</p>
                      <span className={`history-badge ${item.status === 'THREAT' ? 'threat' : 'safe'}`}>{item.status}</span>
                    </div>
                    <div className="history-right">
                      <p>{item.topClass}</p>
                      <span>{Math.round((item.confidence || 0) * 100)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <article className="neo-card quick-glance reveal-up delay-2">
            <h2>Quick Glance</h2>
            <div className="glance-grid">
              <div>
                <p>Model</p>
                <strong>YOLOv8-SEC</strong>
              </div>
              <div>
                <p>Latest status</p>
                <strong>{latest?.status || 'STANDBY'}</strong>
              </div>
              <div>
                <p>Top class</p>
                <strong>{latest?.topClass || 'none'}</strong>
              </div>
              <div>
                <p>Confidence</p>
                <strong>{latest ? `${Math.round((latest.confidence || 0) * 100)}%` : '0%'}</strong>
              </div>
            </div>
          </article>
        </section>

        <section className="cta-row reveal-up delay-2">
          <button onClick={handleAnalyze} disabled={!imageFile || isLoading} className="btn-run">
            {isLoading ? 'ANALYZING...' : 'RUN ANALYSIS'}
          </button>
          <button onClick={handleClear} disabled={isLoading} className="btn-clear">CLEAR SESSION</button>
        </section>
      </main>
    </div>
  )
}
