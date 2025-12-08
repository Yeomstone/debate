/**
 * UserAvatar 컴포넌트
 * 
 * 사용자 프로필 이미지를 표시하는 재사용 가능한 컴포넌트입니다.
 * 이미지가 없거나 로드 실패 시 기본 프로필 이미지를 표시합니다.
 * 
 * @example
 * <UserAvatar src={user.profileImage} alt={user.nickname} size="medium" />
 * 
 * Props:
 *   src: string | null - 프로필 이미지 URL
 *   alt: string - 이미지 대체 텍스트 (기본값: '프로필')
 *   size: 'small' | 'medium' | 'large' | 'xlarge' - 아바타 크기 (기본값: 'medium')
 *   className: string - 추가 CSS 클래스
 */

import defaultProfileImage from '../../assets/default-profile.png';
import './UserAvatar.css';

const UserAvatar = ({
    src,
    alt = '프로필',
    size = 'medium',
    className = ''
}) => {
    return (
        <div className={`user-avatar-component ${size} ${className}`}>
            <img
                src={src || defaultProfileImage}
                alt={alt}
                onError={(e) => {
                    e.target.onerror = null; // 무한 루프 방지
                    e.target.src = defaultProfileImage;
                }}
            />
        </div>
    );
};

export default UserAvatar;
