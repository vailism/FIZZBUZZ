import React, { useState } from 'react'

const DEFAULT_API_BASE_URL = window.location.port === '5173'
  ? 'http://127.0.0.1:8000'
  : window.location.origin
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL

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
    <div className="det-item" style={{ background: style.badge, border: `1px solid ${style.border}`, animationDelay: `${index * 80}ms` }}>
      <div className="det-head">
        <span className="det-class" style={{ color: style.text }}>
            {detection.class}
        </span>
        <span className="det-confidence" style={{ color: style.text }}>{pct}%</span>
      </div>
      <div className="det-bar-bg">
        <div className="det-bar" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${style.bar}88, ${style.bar})` }} />
      </div>
    </div>
  )
}

const ResultBox = ({ inputImage, resultImage, detections, status, isLoading }) => {
  const isThreat = status === 'THREAT'
  const isSafe = status === 'SAFE'
  const hasResult = !!status
  const [comparison, setComparison] = useState(56)
  const hasComparison = Boolean(inputImage && resultImage && !isLoading)

  return (
    <div className="result-wrap">
      <div className="result-head">
        <h3>Inference Output</h3>
        <span className={`result-pill ${isThreat ? 'threat' : isSafe ? 'safe' : ''}`}>{status || 'STANDBY'}</span>
      </div>

      <div className="result-stage">
        {isLoading && (
          <div className="result-loading">
            <div className="result-spinner" />
            <p>Processing frame...</p>
          </div>
        )}

        {resultImage && !isLoading ? (
          <>
            {hasComparison ? (
              <div className="compare-wrap">
                <img src={inputImage} alt="Original input" className="compare-base" />
                <div className="compare-overlay" style={{ width: `${comparison}%` }}>
                  <img src={`${API_BASE_URL}${resultImage}`} alt="Model output" className="compare-top" />
                </div>
                <div className="compare-divider" style={{ left: `${comparison}%` }} />
                <div className="compare-label left">ORIGINAL</div>
                <div className="compare-label right">AI OUTPUT</div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={comparison}
                  className="compare-slider"
                  onChange={(event) => setComparison(Number(event.target.value))}
                />
              </div>
            ) : (
              <div className="result-image-wrap">
                <img
                  src={`${API_BASE_URL}${resultImage}`}
                  alt="Detection result"
                  className="result-image"
                />
              </div>
            )}
          </>
        ) : !isLoading && (
          <div className="result-empty">
            <span>Awaiting scan result</span>
          </div>
        )}
      </div>

      {hasResult && !isLoading && (
        <div className="det-block">
          <div className="det-block-head">
            <h4>Detections</h4>
            <span>{detections?.length || 0}</span>
          </div>

          {detections && detections.length > 0 ? (
            <div className="det-list">
              {detections.map((det, i) => (
                <DetectionBadge key={i} detection={det} index={i} />
              ))}
            </div>
          ) : (
            <div className="safe-banner">No threats detected</div>
          )}
        </div>
      )}
    </div>
  )
}

export default ResultBox
