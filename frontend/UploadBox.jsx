import React, { useCallback, useRef, useState } from 'react'

const UploadBox = ({ image, onImageChange, onClear }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp']
  const MAX_SIZE = 10 * 1024 * 1024 // 10MB

  const validateFile = (file) => {
    if (!ACCEPTED.includes(file.type)) {
      return 'Invalid file type. Please upload JPG, PNG, WEBP, or BMP.'
    }
    if (file.size > MAX_SIZE) {
      return 'File too large. Maximum size is 10MB.'
    }
    return null
  }

  const processFile = useCallback((file) => {
    setError('')
    const err = validateFile(file)
    if (err) {
      setError(err)
      return
    }
    const url = URL.createObjectURL(file)
    onImageChange(file, url)
  }, [onImageChange])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) processFile(file)
  }, [processFile])

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) processFile(file)
  }

  const handleClear = () => {
    setError('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    onClear()
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-accent" style={{ boxShadow: '0 0 8px #00d4ff' }} />
        <span className="font-mono text-xs text-muted tracking-widest uppercase">Input Channel</span>
        <div className="flex-1 h-px bg-border ml-2" />
        <span className="font-mono text-xs text-muted">SYS/SCAN-01</span>
      </div>

      {/* Drop zone */}
      <div
        className={`relative flex-1 rounded-xl border-2 border-dashed transition-all duration-300 overflow-hidden cursor-pointer
          ${isDragging ? 'drag-active' : image ? 'border-border' : 'border-muted hover:border-accent/50'}
          ${image ? 'border-solid' : ''}
        `}
        style={{ minHeight: '280px', background: 'rgba(10,14,26,0.6)' }}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !image && fileInputRef.current?.click()}
      >
        {image ? (
          <div className="relative w-full h-full animate-fade-in">
            <img
              src={image}
              alt="Uploaded X-ray"
              className="w-full h-full object-contain"
              style={{ minHeight: '280px' }}
            />
            {/* Overlay info */}
            <div className="absolute bottom-0 left-0 right-0 p-3"
              style={{ background: 'linear-gradient(transparent, rgba(6,10,20,0.9))' }}>
              <span className="font-mono text-xs text-accent/80">▶ IMAGE LOADED — READY FOR ANALYSIS</span>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 p-6">
            {/* Animated scan icon */}
            <div className="relative">
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                <rect x="2" y="2" width="68" height="68" rx="8"
                  stroke={isDragging ? '#00d4ff' : '#1a2540'}
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                  className={isDragging ? 'animate-pulse' : ''}
                />
                {/* X-ray icon lines */}
                <line x1="18" y1="36" x2="54" y2="36" stroke="#00d4ff" strokeWidth="1.5" strokeOpacity="0.4" />
                <line x1="36" y1="18" x2="36" y2="54" stroke="#00d4ff" strokeWidth="1.5" strokeOpacity="0.4" />
                <circle cx="36" cy="36" r="12" stroke="#00d4ff" strokeWidth="1.5" strokeOpacity="0.5" fill="none" />
                <circle cx="36" cy="36" r="4" fill="#00d4ff" fillOpacity="0.6" />
                {/* Corner marks */}
                <path d="M8 20 L8 8 L20 8" stroke="#00d4ff" strokeWidth="2" strokeOpacity="0.8" fill="none" />
                <path d="M64 20 L64 8 L52 8" stroke="#00d4ff" strokeWidth="2" strokeOpacity="0.8" fill="none" />
                <path d="M8 52 L8 64 L20 64" stroke="#00d4ff" strokeWidth="2" strokeOpacity="0.8" fill="none" />
                <path d="M64 52 L64 64 L52 64" stroke="#00d4ff" strokeWidth="2" strokeOpacity="0.8" fill="none" />
              </svg>
            </div>

            <div className="text-center space-y-2">
              <p className="font-display text-sm tracking-wider" style={{ color: isDragging ? '#00d4ff' : '#6b82a6' }}>
                {isDragging ? 'DROP TO LOAD' : 'DRAG & DROP IMAGE'}
              </p>
              <p className="font-body text-xs text-muted">or click to browse files</p>
              <p className="font-mono text-xs" style={{ color: '#2a3a5a' }}>JPG · PNG · WEBP · BMP · MAX 10MB</p>
            </div>

            {isDragging && (
              <div className="scan-line" style={{ boxShadow: '0 0 8px rgba(0,212,255,0.6)' }} />
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="animate-slide-up flex items-center gap-2 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(255,45,85,0.1)', border: '1px solid rgba(255,45,85,0.3)' }}>
          <span className="text-threat text-xs">⚠</span>
          <span className="font-mono text-xs text-threat">{error}</span>
        </div>
      )}

      {/* Actions */}
      {image && (
        <div className="flex gap-3 animate-slide-up">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 px-4 rounded-lg font-mono text-xs tracking-wider border transition-all duration-200 hover:border-accent/60 hover:text-accent"
            style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', color: '#6b82a6' }}
          >
            REPLACE
          </button>
          <button
            onClick={handleClear}
            className="flex-1 py-2 px-4 rounded-lg font-mono text-xs tracking-wider border transition-all duration-200 hover:border-threat/60 hover:text-threat"
            style={{ background: 'rgba(255,45,85,0.05)', border: '1px solid rgba(255,45,85,0.2)', color: '#6b82a6' }}
          >
            CLEAR
          </button>
        </div>
      )}
    </div>
  )
}

export default UploadBox
