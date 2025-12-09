/**
 * UserAvatar 컴포넌트 (관리자 사이트용)
 * 
 * 사용자 프로필 이미지를 표시하는 재사용 가능한 컴포넌트입니다.
 * 이미지가 없거나 로드 실패 시 기본 프로필 이미지를 표시합니다.
 * 프로필 이미지를 클릭하면 모달로 크게 볼 수 있습니다.
 * 
 * @example
 * <UserAvatar src={user.profileImage} alt={user.nickname} size="medium" />
 * 
 * Props:
 *   src: string | null - 프로필 이미지 URL
 *   alt: string - 이미지 대체 텍스트 (기본값: '프로필')
 *   size: 'small' | 'medium' | 'large' | 'xlarge' - 아바타 크기 (기본값: 'medium')
 *   className: string - 추가 CSS 클래스
 *   onClick: Function - 클릭 이벤트 핸들러 (선택적, 제공하지 않으면 기본 모달 동작)
 *   showModal: boolean - 클릭 시 모달 표시 여부 (기본값: true)
 */

import { useState } from 'react';
import ImageViewModal from './ImageViewModal';
import './UserAvatar.css';

const UserAvatar = ({
    src,
    alt = '프로필',
    size = 'medium',
    className = '',
    onClick,
    showModal = true
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    // 기본 프로필 이미지 (이모지 또는 초기)
    const defaultAvatar = alt?.[0]?.toUpperCase() || '👤';
    
    const handleClick = (e) => {
        // 항상 이벤트 전파를 막아서 부모 요소의 클릭 이벤트와 충돌 방지
        e.stopPropagation();
        e.preventDefault();
        
        if (onClick) {
            // 커스텀 onClick이 제공되면 모달 표시하지 않음
            onClick(e);
        } else if (showModal && src) {
            // src가 있을 때만 모달 표시
            setIsModalOpen(true);
        }
        // showModal={false}이고 onClick이 없으면 아무것도 하지 않음
    };

    const handleImageError = (e) => {
        e.target.onerror = null; // 무한 루프 방지
        e.target.style.display = 'none';
        const span = document.createElement('span');
        span.textContent = defaultAvatar;
        e.target.parentElement.appendChild(span);
    };
    
    return (
        <>
            <div 
                className={`user-avatar-component ${size} ${className} ${showModal && src ? 'clickable' : ''}`}
                onClick={showModal || onClick ? handleClick : undefined}
            >
                {src ? (
                    <img
                        src={src}
                        alt={alt}
                        onError={handleImageError}
                    />
                ) : (
                    <span>{defaultAvatar}</span>
                )}
            </div>
            {showModal && (
                <ImageViewModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    imageUrl={src}
                    alt={alt}
                />
            )}
        </>
    );
};

export default UserAvatar;

