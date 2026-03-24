import React from 'react'

const StatusBar = ({ status, isLoading, detections }) => {
  const isThreat = status === 'THREAT'
  const isSafe = status === 'SAFE'

  const highestConf = detections?.length > 0
    ? Math.max(...detections.map(d => d.confidence || 0))
    : null

  return (
    <div className="relative overflow-hidden rounded-xl transition-all duration-700"
      style={{
        background: isLoading
          ? 'rgba(0,212,255,0.04)'
          : isThreat
          ? 'rgba(255,45,85,0.06)'
          : isSafe
          ? 'rgba(0,255,136,0.04)'
          : 'rgba(10,14,26,0.6)',
        border: isLoading
          ? '1px solid rgba(0,212,255,0.2)'
          : isThreat
          ? '1px solid rgba(255,45,85,0.35)'
          : isSafe
          ? '1px solid rgba(0,255,136,0.25)'
          : '1px solid #1a2540',
      }}
    >
      {/* Background gradient strip */}
      {(isThreat || isSafe) && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isThreat
              ? 'linear-gradient(90deg, rgba(255,45,85,0.08) 0%, transparent 60%)'
              : 'linear-gradient(90deg, rgba(0,255,136,0.06) 0%, transparent 60%)',
          }}
        />
      )}

      <div className="relative flex flex-wrap items-center gap-4 px-6 py-4">
        {/* Status indicator */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10">
            {/* Ring */}
            <svg width="40" height="40" className="absolute" viewBox="0 0 40 40">
              <circle cx="20" cy="20" r="17" fill="none"
                stroke={isLoading ? '#00d4ff33' : isThreat ? '#ff2d5533' : isSafe ? '#00ff8833' : '#1a2540'}
                strokeWidth="1.5"
              />
              {(isThreat || isSafe) && (
                <circle cx="20" cy="20" r="17" fill="none"
                  stroke={isThreat ? '#ff2d55' : '#00ff88'}
                  strokeWidth="1.5"
                  strokeDasharray="107"
                  strokeDashoffset={isThreat ? '0' : '26'}
                  strokeLinecap="round"
                  style={{ transformOrigin: '20px 20px', transform: 'rotate(-90deg)', transition: 'stroke-dashoffset 1s ease' }}
                />
              )}
            </svg>
            {/* Center dot */}
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${
              isThreat ? 'animate-ping' : ''
            }`}
              style={{
                background: isLoading ? '#00d4ff' : isThreat ? '#ff2d55' : isSafe ? '#00ff88' : '#3a4a6b',
                boxShadow: isLoading
                  ? '0 0 10px #00d4ff'
                  : isThreat
                  ? '0 0 10px #ff2d55'
                  : isSafe
                  ? '0 0 10px #00ff88'
                  : 'none',
              }}
            />
          </div>

          {/* Status text */}
          <div>
            <p className="font-mono text-xs text-muted tracking-widest mb-0.5">SYSTEM STATUS</p>
            <p
              className={`font-display font-bold tracking-widest text-lg ${
                isLoading ? 'animate-pulse' : isThreat ? 'animate-pulse-threat' : ''
              }`}
              style={{
                color: isLoading ? '#00d4ff' : isThreat ? '#ff2d55' : isSafe ? '#00ff88' : '#3a4a6b',
                letterSpacing: '0.15em',
              }}
            >
              {isLoading ? 'SCANNING' : status || 'STANDBY'}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-10 bg-border" />

        {/* Metrics */}
        <div className="flex gap-6 flex-wrap">
          <div>
            <p className="font-mono text-xs text-muted tracking-widest mb-1">THREATS FOUND</p>
            <p className="font-display text-base font-bold" style={{
              color: detections?.length > 0 ? '#ff2d55' : '#3a4a6b'
            }}>
              {detections?.length ?? '—'}
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-muted tracking-widest mb-1">MAX CONFIDENCE</p>
            <p className="font-display text-base font-bold" style={{
              color: highestConf != null ? '#ff9f00' : '#3a4a6b'
            }}>
              {highestConf != null ? `${Math.round(highestConf * 100)}%` : '—'}
            </p>
          </div>
          {detections?.length > 0 && (
            <div>
              <p className="font-mono text-xs text-muted tracking-widest mb-1">THREAT CLASSES</p>
              <div className="flex gap-1 flex-wrap">
                {[...new Set(detections.map(d => d.class))].map((cls) => (
                  <span key={cls} className="font-mono text-xs px-1.5 py-0.5 rounded uppercase"
                    style={{ background: 'rgba(255,45,85,0.15)', color: '#ff2d55', border: '1px solid rgba(255,45,85,0.3)' }}>
                    {cls}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right side alert */}
        {isThreat && (
          <div className="ml-auto flex items-center gap-2">
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1 rounded-full animate-pulse"
                  style={{
                    height: `${14 + i * 5}px`,
                    background: '#ff2d55',
                    animationDelay: `${i * 150}ms`,
                    opacity: 0.8,
                  }}
                />
              ))}
            </div>
            <span className="font-mono text-xs text-threat animate-pulse tracking-widest hidden sm:block">
              ALERT
            </span>
          </div>
        )}

        {isSafe && (
          <div className="ml-auto flex items-center gap-2">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M4 10L8 14L16 6" stroke="#00ff88" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-mono text-xs tracking-widest hidden sm:block" style={{ color: '#00ff88' }}>
              CLEARED
            </span>
          </div>
        )}
      </div>

      {/* Animated bottom border */}
      {(isThreat || isLoading) && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 overflow-hidden">
          <div className="h-full animate-pulse"
            style={{
              background: isThreat
                ? 'linear-gradient(90deg, transparent, #ff2d55, transparent)'
                : 'linear-gradient(90deg, transparent, #00d4ff, transparent)',
            }}
          />
        </div>
      )}
    </div>
  )
}

export default StatusBar
