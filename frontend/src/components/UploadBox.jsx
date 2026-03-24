import React, { useCallback, useRef, useState } from 'react'

const UploadBox = ({ image, onImageChange, onClear }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef(null)

  const ACCEPTED = ['image/jpeg', 'image/png', 'image/webp', 'image/bmp']
  const MAX_SIZE = 10 * 1024 * 1024

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
    <div className="upload-wrap">
      <div className="upload-head">
        <h3>Input Surface</h3>
        <p>JPG PNG WEBP BMP</p>
      </div>

      <div
        className={`drop-zone ${isDragging ? 'drop-zone-active' : ''} ${image ? 'drop-zone-filled' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !image && fileInputRef.current?.click()}
      >
        {image ? (
          <div className="preview-wrap">
            <img src={image} alt="Uploaded X-ray" className="preview-image" />
            <div className="preview-overlay">
              <span>Image loaded and ready</span>
            </div>
          </div>
        ) : (
          <div className="drop-empty">
            <div className="drop-symbol-wrap">
              <span className="drop-symbol">+</span>
            </div>
            <div className="drop-copy">
              <p>{isDragging ? 'Drop to upload' : 'Drag and drop your X-ray image'}</p>
              <span>or click to browse files up to 10MB</span>
            </div>
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

      {error && (
        <div className="upload-error">{error}</div>
      )}

      {image && (
        <div className="upload-actions">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="upload-btn upload-btn-alt"
          >
            Replace
          </button>
          <button
            onClick={handleClear}
            className="upload-btn upload-btn-danger"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  )
}

export default UploadBox
