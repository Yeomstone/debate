/**
 * ImageViewModal 컴포넌트
 * 
 * 이미지를 크게 보여주는 모달입니다.
 * 프로필 이미지나 다른 이미지를 확대해서 볼 때 사용합니다.
 * 
 * @example
 * <ImageViewModal 
 *   isOpen={isOpen} 
 *   onClose={handleClose} 
 *   imageUrl={imageUrl} 
 *   alt="프로필 이미지" 
 * />
 * 
 * Props:
 *   isOpen: boolean - 모달 열림/닫힘 상태
 *   onClose: Function - 모달 닫기 함수
 *   imageUrl: string | null - 표시할 이미지 URL
 *   alt: string - 이미지 대체 텍스트 (기본값: '이미지')
 */

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import './ImageViewModal.css';

const ImageViewModal = ({ 
  isOpen, 
  onClose, 
  imageUrl, 
  alt = '이미지' 
}) => {
  const modalRef = useRef(null);

  // ESC 키로 모달 닫기
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    // body 스크롤 방지
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // 모달 오버레이 클릭 시 닫기 (이미지 영역 클릭은 제외)
  const handleOverlayClick = (e) => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  if (!isOpen || !imageUrl) return null;

  // React Portal을 사용하여 body에 직접 렌더링
  return createPortal(
    <div 
      className="image-view-modal-overlay" 
      onClick={handleOverlayClick}
      ref={modalRef}
    >
      <div className="image-view-modal-content" onClick={(e) => e.stopPropagation()}>
        <button 
          className="image-view-modal-close" 
          onClick={onClose}
          aria-label="닫기"
        >
          ×
        </button>
        <div className="image-view-modal-image-wrapper">
          <img 
            src={imageUrl} 
            alt={alt}
            className="image-view-modal-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/default-profile.png';
            }}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ImageViewModal;

