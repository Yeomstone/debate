/**
 * 이미지 업로드 모달 컴포넌트
 *
 * 이미지 URL 입력 또는 파일 업로드를 위한 모달입니다.
 */

import { useState, useRef } from 'react'
import './ImageUploadModal.css'

/**
 * ImageUploadModal 컴포넌트
 *
 * @param {boolean} isOpen - 모달 열림/닫힘 상태
 * @param {Function} onClose - 모달 닫기 함수
 * @param {Function} onUrlSubmit - URL 입력 완료 시 호출되는 함수 (url) => void
 * @param {Function} onFileSelect - 파일 선택 시 호출되는 함수 (file) => void
 * @returns {JSX.Element|null} 모달 컴포넌트
 */
const ImageUploadModal = ({ isOpen, onClose, onUrlSubmit, onFileSelect }) => {
  const [imageUrl, setImageUrl] = useState('')
  const [activeTab, setActiveTab] = useState('url') // 'url' 또는 'file'
  const fileInputRef = useRef(null)

  if (!isOpen) return null

  /**
   * URL 입력 제출 처리
   */
  const handleUrlSubmit = (e) => {
    e.preventDefault()
    const url = imageUrl.trim()
    if (url) {
      // URL 유효성 검사
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        onUrlSubmit(url)
        setImageUrl('')
        onClose()
      } else {
        alert('유효한 이미지 URL을 입력해주세요.\n\n예: https://example.com/image.jpg')
      }
    }
  }

  /**
   * 파일 선택 처리
   */
  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 검증 (10MB 제한)
    if (file.size > 10 * 1024 * 1024) {
      alert('이미지 크기는 10MB 이하여야 합니다.')
      return
    }

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    onFileSelect(file)
    onClose()
  }

  /**
   * 파일 선택 버튼 클릭
   */
  const handleFileButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>이미지 추가</h2>
          <button className="modal-close" onClick={onClose} aria-label="닫기">
            ×
          </button>
        </div>

        <div className="modal-tabs">
          <button
            className={`modal-tab ${activeTab === 'url' ? 'active' : ''}`}
            onClick={() => setActiveTab('url')}
          >
            이미지 URL
          </button>
          <button
            className={`modal-tab ${activeTab === 'file' ? 'active' : ''}`}
            onClick={() => setActiveTab('file')}
          >
            파일 업로드
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'url' ? (
            <form onSubmit={handleUrlSubmit} className="image-url-form">
              <label htmlFor="image-url">이미지 URL</label>
              <input
                type="text"
                id="image-url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="form-input"
                autoFocus
              />
              <p className="form-hint">
                이미지의 URL을 입력하세요. http:// 또는 https://로 시작하는 URL을 사용할 수 있습니다.
              </p>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={onClose}>
                  취소
                </button>
                <button type="submit" className="btn btn-primary">
                  추가
                </button>
              </div>
            </form>
          ) : (
            <div className="image-file-form">
              <div className="file-upload-area">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <div className="file-upload-placeholder">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <p>이미지 파일을 선택하세요</p>
                  <p className="file-upload-hint">최대 10MB, JPG, PNG, GIF 등</p>
                </div>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleFileButtonClick}
                >
                  파일 선택
                </button>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={onClose}>
                  취소
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ImageUploadModal

