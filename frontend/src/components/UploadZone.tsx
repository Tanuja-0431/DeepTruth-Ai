import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Props {
  mode: 'image' | 'video'
  onUpload: (file: File) => void
  loading: boolean
  progress: number
  disabled: boolean
}

const ACCEPT = {
  image: 'image/jpeg,image/png,image/webp,image/bmp',
  video: 'video/mp4,video/avi,video/quicktime,video/x-matroska,video/webm',
}

export function UploadZone({ mode, onUpload, loading, progress, disabled }: Props) {
  const [drag, setDrag] = useState(false)
  const [fileData, setFileData] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  // Clear state when the mode switches between image/video
  useEffect(() => {
    setFileData(null)
    setPreviewUrl(null)
  }, [mode])

  // Cleanup object URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFile = useCallback((selected: File | null) => {
    if (!selected || disabled) return
    const ext = '.' + selected.name.split('.').pop()?.toLowerCase()
    const imgExt = ['.jpg', '.jpeg', '.png', '.webp', '.bmp']
    const vidExt = ['.mp4', '.avi', '.mov', '.mkv', '.webm']
    const ok = mode === 'image' ? imgExt.includes(ext) : vidExt.includes(ext)

    if (ok) {
      setFileData(selected)
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(selected))
    }
  }, [mode, disabled, previewUrl])

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDrag(false)
    if (!fileData) handleFile(e.dataTransfer.files[0] || null)
  }

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!fileData && !disabled) setDrag(true)
  }

  const onDragLeave = () => setDrag(false)

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFile(e.target.files?.[0] || null)
    e.target.value = ''
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setFileData(null)
    setPreviewUrl(null)
  }

  const handleUpload = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (fileData) onUpload(fileData)
  }

  return (
    <motion.div
      className={`upload-zone glass ${drag ? 'drag' : ''} ${loading ? 'loading' : ''}`}
      style={{
        border: drag ? '2px dashed var(--accent)' : '2px dashed rgba(255,255,255,0.1)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onDrop={onDrop}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: drag ? 1.02 : 1,
        borderColor: drag ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
        backgroundColor: drag ? 'rgba(34, 197, 94, 0.05)' : 'rgba(255,255,255,0.03)'
      }}
      transition={{ duration: 0.2 }}
    >
      <input
        type="file"
        accept={ACCEPT[mode]}
        onChange={onInputChange}
        disabled={disabled || !!fileData}
        className="file-input"
        style={{
          display: fileData ? 'none' : 'block',
          zIndex: 5
        }}
      />

      {loading ? (
        <div className="progress-wrap" style={{ position: 'relative', zIndex: 10 }}>
          <div className="progress-bar">
            <motion.div
              className="progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p>Analyzing {mode}...</p>
        </div>
      ) : fileData && previewUrl ? (
        <motion.div
          className="preview-container"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            gap: '1.25rem',
            position: 'relative',
            zIndex: 10
          }}
        >
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: '280px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
            backgroundColor: 'rgba(0,0,0,0.4)'
          }}>
            {mode === 'image' ? (
              <img
                src={previewUrl}
                alt="Preview"
                style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: '200px' }}
              />
            ) : (
              <video
                src={previewUrl}
                style={{ width: '100%', display: 'block', objectFit: 'contain', maxHeight: '200px' }}
                preload="metadata"
                onLoadedMetadata={(e) => {
                  e.currentTarget.currentTime = 0.001;
                }}
              />
            )}

            <button
              onClick={handleRemove}
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                background: 'rgba(0,0,0,0.6)',
                color: '#fff',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'background 0.2s',
                backdropFilter: 'blur(4px)'
              }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.9)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.6)'}
              aria-label="Remove file"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div style={{ textAlign: 'center', width: '100%' }}>
            <p style={{ margin: '0 0 1rem 0', fontWeight: 500, fontSize: '0.95rem', color: 'var(--text)', wordBreak: 'break-all', padding: '0 1rem' }}>
              {fileData.name}
            </p>
            <button
              onClick={handleUpload}
              style={{
                background: 'var(--accent)',
                color: 'var(--bg)',
                border: 'none',
                padding: '0.75rem 2rem',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(34, 197, 94, 0.25)',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 16px rgba(34, 197, 94, 0.35)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.25)';
              }}
              onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.97)'}
              onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            >
              Analyze {mode === 'image' ? 'Image' : 'Video'}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none', position: 'relative', zIndex: 1 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="upload-icon" style={{
            color: drag ? 'var(--accent)' : 'var(--text-muted)',
            transform: drag ? 'scale(1.1) translateY(-5px)' : 'scale(1)',
            transition: 'all 0.3s ease'
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p className="upload-text" style={{
            color: drag ? 'var(--text)' : 'inherit',
            fontWeight: drag ? 600 : 'normal',
            transition: 'all 0.2s'
          }}>
            {drag ? 'Drop file to preview' : `Drag & drop your ${mode} here`}
          </p>
          <p className="upload-hint" style={{ marginTop: '0.25rem' }}>
            or click to browse
          </p>
          <p className="upload-hint" style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '1.25rem' }}>
            {mode === 'image' ? 'JPEG, PNG, WebP, BMP (max 10MB)' : 'MP4, AVI, MOV, MKV, WebM (max 100MB)'}
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
