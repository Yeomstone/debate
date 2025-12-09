/**
 * DebateCard 컴포넌트
 * 
 * 토론 목록에서 각 토론을 카드 형태로 표시하는 컴포넌트입니다.
 * 
 * 주요 기능:
 * - 토론 제목, 내용 미리보기
 * - 카테고리 및 상태 배지 표시
 * - 작성자 정보 및 작성일 표시
 * - 통계 정보 표시 (좋아요, 댓글, 조회수)
 * - 작성자 클릭 시 프로필 페이지로 이동
 */

import { Link, useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import UserAvatar from '../common/UserAvatar'
import './DebateCard.css'

/**
 * DebateCard 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.debate - 토론 데이터 객체
 * @param {Object} props.filterState - 필터 상태 (목록으로 돌아갈 때 복원용)
 * @returns {JSX.Element} 토론 카드 컴포넌트
 */
const DebateCard = ({ debate, filterState = {} }) => {
  const navigate = useNavigate()

  /**
   * HTML 태그를 제거하고 순수 텍스트만 추출하는 함수
   */
  const stripHtml = (html) => {
    if (!html) return ''
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  /**
   * 토론 상태에 따른 배지 정보 반환
   */
  const getStatusBadge = (status) => {
    const statusMap = {
      SCHEDULED: { text: '예정', class: 'status-scheduled' },
      ACTIVE: { text: '진행중', class: 'status-active' },
      ENDED: { text: '종료', class: 'status-ended' },
    }
    return statusMap[status] || statusMap.SCHEDULED
  }

  /**
   * 작성자 프로필로 이동
   */
  const handleAuthorClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/users/${debate.userId}`)
  }

  const status = getStatusBadge(debate.status)
  const plainText = stripHtml(debate.content || '')

  return (
    <Link
      to={`/debate/${debate.id}`}
      className="debate-card-link"
      state={filterState}
    >
      <div className="debate-card">
        <div className="debate-card-header">
          {debate.categoryName && (
            <span className="category-badge">{debate.categoryName}</span>
          )}
          <span className={`status-badge ${status.class}`}>{status.text}</span>
        </div>

        <h3 className="debate-title">{debate.title}</h3>

        <p className="debate-excerpt">
          {plainText.substring(0, 150)}
          {plainText.length > 150 && '...'}
        </p>

        <div className="debate-meta" onClick={(e) => e.stopPropagation()}>
          <span className="author">
            작성자:{' '}
            <UserAvatar
              src={debate.profileImage}
              alt={debate.nickname || '알 수 없음'}
              size="small"
              className="author-avatar-inline"
            />
            <span className="author-link" onClick={handleAuthorClick}>
              {debate.nickname || '알 수 없음'}
            </span>
          </span>
          <span className="date">
            {format(new Date(debate.createdAt), 'yyyy-MM-dd')}
          </span>
        </div>

        <div className="debate-stats">
          <span className="stat">👍 {debate.likeCount || 0}</span>
          <span className="stat">💬 {debate.commentCount || 0}</span>
          <span className="stat">👁️ {debate.viewCount || 0}</span>
        </div>
      </div>
    </Link>
  )
}

export default DebateCard
