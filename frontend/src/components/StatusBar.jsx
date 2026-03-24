import React from 'react'

const StatusBar = ({ status, isLoading, detections }) => {
  const isThreat = status === 'THREAT'
  const isSafe = status === 'SAFE'

  const highestConf = detections?.length > 0
    ? Math.max(...detections.map(d => d.confidence || 0))
    : null

  return (
    <div className="status-strip">
      <div className="status-main">
        <span className={`status-dot ${isThreat ? 'danger' : isSafe ? 'safe' : isLoading ? 'busy' : ''}`} />
        <div>
          <p>System status</p>
          <h4>{isLoading ? 'SCANNING' : status || 'STANDBY'}</h4>
        </div>
      </div>

      <div className="status-metrics">
        <div>
          <p>Detections</p>
          <strong>{detections?.length ?? 0}</strong>
        </div>
        <div>
          <p>Top confidence</p>
          <strong>{highestConf != null ? `${Math.round(highestConf * 100)}%` : '0%'}</strong>
        </div>
        <div>
          <p>Classes</p>
          <strong>{detections?.length ? [...new Set(detections.map(d => d.class))].join(', ') : 'none'}</strong>
        </div>
      </div>
    </div>
  )
}

export default StatusBar
