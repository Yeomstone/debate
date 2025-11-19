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
 */

import { Link, useNavigate, useLocation } from 'react-router-dom'
import { format } from 'date-fns'
import './DebateCard.css'

/**
 * DebateCard 컴포넌트
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {Object} props.debate - 토론 데이터 객체
 * @param {number} props.debate.id - 토론 ID
 * @param {string} props.debate.title - 토론 제목
 * @param {string} props.debate.content - 토론 내용
 * @param {string} props.debate.status - 토론 상태 (SCHEDULED, ACTIVE, ENDED)
 * @param {string} props.debate.categoryName - 카테고리 이름
 * @param {number} props.debate.userId - 작성자 ID
 * @param {string} props.debate.nickname - 작성자 닉네임
 * @param {number} props.debate.likeCount - 좋아요 수
 * @param {number} props.debate.commentCount - 댓글 수
 * @param {number} props.debate.viewCount - 조회수
 * @param {string} props.debate.createdAt - 생성일시
 * @param {Object} props.filterState - 필터 상태 (목록으로 돌아갈 때 복원용)
 * @param {string} props.filterState.categoryId - 카테고리 필터
 * @param {string} props.filterState.status - 상태 필터
 * @param {string} props.filterState.sort - 정렬 필터
 * @param {string} props.filterState.keyword - 검색어
 * @returns {JSX.Element} 토론 카드 컴포넌트
 */
const DebateCard = ({ debate, filterState = {} }) => {
  const navigate = useNavigate()

  /**
   * HTML 태그를 제거하고 순수 텍스트만 추출하는 함수
   * 
   * @param {string} html - HTML 문자열
   * @returns {string} 순수 텍스트
   */
  const stripHtml = (html) => {
    if (!html) return ''
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  /**
   * 토론 상태에 따른 배지 정보 반환
   * 
   * @param {string} status - 토론 상태 (SCHEDULED, ACTIVE, ENDED)
   * @returns {Object} 배지 텍스트와 CSS 클래스
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
   * 작성자 프로필로 이동하는 핸들러
   * 카드 클릭 이벤트를 막고 작성자 프로필로만 이동
   */
  const handleAuthorClick = (e) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/users/${debate.userId}`)
  }

  // 토론 상태 배지 정보 가져오기
  const status = getStatusBadge(debate.status)
  
  // HTML 태그 제거 후 텍스트만 추출
  const plainText = stripHtml(debate.content || '')

  return (
    <Link 
      to={`/debate/${debate.id}`} 
      className="debate-card-link"
      state={filterState}
    >
      <div className="debate-card">
        {/* 카드 헤더: 카테고리 및 상태 배지 */}
        <div className="debate-card-header">
          {/* 카테고리 배지 (카테고리가 있는 경우만 표시) */}
          {debate.categoryName && (
            <span className="category-badge">{debate.categoryName}</span>
          )}
          {/* 상태 배지 */}
          <span className={`status-badge ${status.class}`}>{status.text}</span>
        </div>
        
        {/* 토론 제목 */}
        <h3 className="debate-title">
          {debate.title}
        </h3>
        
        {/* 토론 내용 미리보기 (150자까지만 표시, HTML 태그 제거) */}
        <p className="debate-excerpt">
          {plainText.substring(0, 150)}
          {plainText.length > 150 && '...'}
        </p>
        
        {/* 메타 정보: 작성자 및 작성일 */}
        <div className="debate-meta" onClick={(e) => e.stopPropagation()}>
          <span className="author">
            작성자:{' '}
            <span className="author-link" onClick={handleAuthorClick}>
              {debate.nickname || '알 수 없음'}
            </span>
          </span>
          <span className="date">
            {format(new Date(debate.createdAt), 'yyyy-MM-dd')}
          </span>
        </div>
        
        {/* 통계 정보: 좋아요, 댓글, 조회수 */}
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

