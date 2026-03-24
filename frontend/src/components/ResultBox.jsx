import React from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000'

const CLASS_COLORS = {
  gun: { bar: '#ff2d55', badge: 'rgba(255,45,85,0.15)', text: '#ff2d55', border: 'rgba(255,45,85,0.4)' },
  knife: { bar: '#ff6b35', badge: 'rgba(255,107,53,0.15)', text: '#ff6b35', border: 'rgba(255,107,53,0.4)' },
  explosive: { bar: '#ff2d55', badge: 'rgba(255,45,85,0.15)', text: '#ff2d55', border: 'rgba(255,45,85,0.4)' },
  default: { bar: '#ff9f00', badge: 'rgba(255,159,0,0.15)', text: '#ff9f00', border: 'rgba(255,159,0,0.4)' },
}

const getClassStyle = (cls) =>
  CLASS_COLORS[cls?.toLowerCase()] || CLASS_COLORS.default

const DetectionBadge = ({ detection, index }) => {
  const style = getClassStyle(detection.class)
  const pct = Math.round((detection.confidence || 0) * 100)

  return (
    <div
      className="animate-slide-up rounded-lg p-3 transition-all duration-200 hover:scale-[1.01]"
      style={{
        animationDelay: `${index * 80}ms`,
        background: style.badge,
        border: `1px solid ${style.border}`,
        opacity: 0,
        animationFillMode: 'forwards',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* Threat icon */}
          <div className="w-5 h-5 flex items-center justify-center rounded"
            style={{ background: `${style.text}22` }}>
            <span style={{ color: style.text, fontSize: '10px' }}>⚠</span>
          </div>
          <span className="font-display text-xs tracking-widest uppercase" style={{ color: style.text }}>
            {detection.class}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs font-bold" style={{ color: style.text }}>
            {pct}%
          </span>
          <span className="font-mono text-xs" style={{ color: `${style.text}88` }}>
            CONF
          </span>
        </div>
      </div>

      {/* Confidence bar */}
      <div className="relative h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="confidence-bar h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: `linear-gradient(90deg, ${style.bar}88, ${style.bar})`,
            boxShadow: `0 0 6px ${style.bar}66`,
          }}
        />
      </div>
    </div>
  )
}

const ResultBox = ({ resultImage, detections, status, isLoading }) => {
  const isThreat = status === 'THREAT'
  const isSafe = status === 'SAFE'
  const hasResult = !!status

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full transition-all duration-500 ${
          isThreat ? 'animate-pulse-threat' : isSafe ? 'animate-pulse-safe' : ''
        }`} style={{
          background: isThreat ? '#ff2d55' : isSafe ? '#00ff88' : '#3a4a6b',
          boxShadow: isThreat ? '0 0 8px #ff2d55' : isSafe ? '0 0 8px #00ff88' : 'none',
        }} />
        <span className="font-mono text-xs text-muted tracking-widest uppercase">Analysis Output</span>
        <div className="flex-1 h-px bg-border ml-2" />
        <span className="font-mono text-xs text-muted">SYS/OUT-01</span>
      </div>

      {/* Output image */}
      <div
        className={`relative flex-1 rounded-xl border overflow-hidden transition-all duration-500 ${
          isThreat ? 'threat-active' : isSafe ? 'safe-active' : ''
        }`}
        style={{
          minHeight: '280px',
          background: 'rgba(10,14,26,0.6)',
          border: '1px solid #1a2540',
        }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 z-10"
            style={{ background: 'rgba(6,10,20,0.85)' }}>
            <div className="relative">
              <svg width="60" height="60" viewBox="0 0 60 60" className="spinner-ring">
                <circle cx="30" cy="30" r="26" fill="none" stroke="#1a2540" strokeWidth="3" />
                <circle
                  cx="30" cy="30" r="26" fill="none"
                  stroke="url(#spinGrad)" strokeWidth="3"
                  strokeLinecap="round"
                  className="spinner-dash"
                />
                <defs>
                  <linearGradient id="spinGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00d4ff" stopOpacity="0" />
                    <stop offset="100%" stopColor="#00d4ff" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
              </div>
            </div>
            <div className="text-center space-y-1">
              <p className="font-display text-xs tracking-widest text-accent animate-pulse">SCANNING</p>
              <p className="font-mono text-xs text-muted">AI model processing...</p>
            </div>
            <div className="scan-line" />
          </div>
        )}

        {resultImage && !isLoading ? (
          <div className="w-full h-full animate-fade-in">
            <img
              src={`${API_BASE_URL}${resultImage}`}
              alt="Detection result"
              className="w-full h-full object-contain"
              style={{ minHeight: '280px' }}
            />
            {isThreat && (
              <div className="absolute top-3 right-3">
                <div className="flex items-center gap-1.5 px-2 py-1 rounded-md font-mono text-xs animate-pulse"
                  style={{ background: 'rgba(255,45,85,0.2)', border: '1px solid rgba(255,45,85,0.5)', color: '#ff2d55' }}>
                  <span>◉</span> THREAT DETECTED
                </div>
              </div>
            )}
          </div>
        ) : !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" opacity="0.25">
              <rect x="8" y="8" width="48" height="48" rx="4" stroke="#3a4a6b" strokeWidth="1.5" strokeDasharray="4 3" />
              <path d="M20 32 L44 32 M32 20 L32 44" stroke="#3a4a6b" strokeWidth="1.5" strokeOpacity="0.5" />
              <circle cx="32" cy="32" r="8" stroke="#3a4a6b" strokeWidth="1.5" fill="none" />
            </svg>
            <span className="font-mono text-xs text-muted">Awaiting scan result</span>
          </div>
        )}
      </div>

      {/* Detections list */}
      {hasResult && !isLoading && (
        <div className="animate-slide-up space-y-2">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-mono text-xs text-muted tracking-widest uppercase">Detected Objects</span>
            <div className="flex-1 h-px bg-border" />
            {detections?.length > 0 && (
              <span className="font-mono text-xs px-2 py-0.5 rounded"
                style={{ background: 'rgba(255,45,85,0.1)', color: '#ff2d55', border: '1px solid rgba(255,45,85,0.3)' }}>
                {detections.length} ITEM{detections.length !== 1 ? 'S' : ''}
              </span>
            )}
          </div>

          {detections && detections.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {detections.map((det, i) => (
                <DetectionBadge key={i} detection={det} index={i} />
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-3 rounded-lg"
              style={{ background: 'rgba(0,255,136,0.05)', border: '1px solid rgba(0,255,136,0.2)' }}>
              <span style={{ color: '#00ff88' }}>✓</span>
              <span className="font-mono text-xs" style={{ color: '#00ff88' }}>No threats detected</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ResultBox
