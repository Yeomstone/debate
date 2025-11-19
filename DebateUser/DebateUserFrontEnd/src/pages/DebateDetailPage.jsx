/**
 * DebateDetailPage 컴포넌트
 * 
 * 토론 상세 페이지입니다.
 * 
 * 주요 기능:
 * - 토론 상세 정보 표시
 * - 댓글 목록 및 작성
 * - 찬성/반대 의견 작성 및 통계 표시
 * - 좋아요 기능
 * - 토론 수정/삭제 (작성자만 가능)
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { debateService } from '../services/debateService'
import { commentService } from '../services/commentService'
import { opinionService } from '../services/opinionService'
import { likeService } from '../services/likeService'
import { format } from 'date-fns'
import './DebateDetailPage.css'

/**
 * DebateDetailPage 컴포넌트
 * 
 * @returns {JSX.Element} 토론 상세 페이지 컴포넌트
 */
const DebateDetailPage = () => {
  // 훅 사용
  const { id } = useParams() // URL 파라미터에서 토론 ID 가져오기
  const navigate = useNavigate() // 페이지 네비게이션
  const location = useLocation() // 현재 위치 정보 (필터 조건 전달용)
  const { user, isAuthenticated } = useAuth() // 인증 정보

  // 상태 관리
  const [debate, setDebate] = useState(null) // 토론 정보
  const [comments, setComments] = useState([]) // 댓글 목록
  const [opinions, setOpinions] = useState([]) // 의견 목록 (찬성/반대)
  const [isLiked, setIsLiked] = useState(false) // 좋아요 여부
  const [loading, setLoading] = useState(true) // 로딩 상태
  const [error, setError] = useState(null) // 에러 상태
  const [commentContent, setCommentContent] = useState('') // 댓글 작성 내용
  const [selectedSide, setSelectedSide] = useState(null) // 선택한 입장 (찬성/반대)
  const [opinionContent, setOpinionContent] = useState('') // 의견 작성 내용

  /**
   * 토론 ID 변경 시 데이터 로딩
   */
  useEffect(() => {
    setError(null) // 에러 상태 초기화
    fetchData()
  }, [id])

  /**
   * 데이터 가져오기
   * 
   * 토론 정보, 댓글 목록, 의견 목록을 병렬로 가져옵니다.
   * 로그인한 경우 좋아요 여부도 확인합니다.
   */
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null) // 에러 상태 초기화
      
      // 토론 정보, 댓글 목록, 의견 목록을 병렬로 가져오기
      const [debateResponse, commentsResponse, opinionsResponse] = await Promise.all([
        debateService.getDebateById(id),
        commentService.getCommentsByDebate(id),
        opinionService.getOpinionsByDebate(id),
      ])

      // ApiResponse 구조에서 data 추출
      setDebate(debateResponse.data || debateResponse)
      setComments((commentsResponse.data || commentsResponse)?.content || [])
      setOpinions((opinionsResponse.data || opinionsResponse) || [])

      // 로그인한 경우 좋아요 여부 확인
      if (isAuthenticated) {
        try {
          const liked = await likeService.isLiked(id)
          setIsLiked(liked.data || liked)
        } catch (likeError) {
          // 좋아요 여부 확인 실패는 무시 (비로그인 사용자일 수 있음)
          console.warn('좋아요 여부 확인 실패:', likeError)
        }
      }
    } catch (error) {
      console.error('데이터 로딩 실패:', error)
      // 에러 메시지 설정
      const errorMessage = error.response?.data?.message || error.message || '토론을 불러오는 중 오류가 발생했습니다.'
      setError(errorMessage)
      setDebate(null) // 토론 정보 초기화
    } finally {
      setLoading(false)
    }
  }

  /**
   * 좋아요 토글 처리
   * 
   * 비로그인 사용자는 로그인 페이지로 이동하고,
   * 로그인한 사용자는 좋아요를 추가/제거합니다.
   */
  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/auth/login')
      return
    }

    try {
      await likeService.toggleLike(id)
      setIsLiked(!isLiked)
      // 좋아요 수 업데이트를 위해 데이터 다시 가져오기
      fetchData()
    } catch (error) {
      console.error('좋아요 처리 실패:', error)
    }
  }

  /**
   * 댓글 작성 처리
   * 
   * 비로그인 사용자는 로그인 페이지로 이동하고,
   * 로그인한 사용자는 댓글을 작성합니다.
   * 
   * @param {Event} e - 폼 제출 이벤트
   */
  const handleCreateComment = async (e) => {
    e.preventDefault()
    if (!isAuthenticated) {
      navigate('/auth/login')
      return
    }

    try {
      await commentService.createComment({
        debateId: parseInt(id),
        content: commentContent,
      })
      setCommentContent('')
      // 댓글 목록 업데이트를 위해 데이터 다시 가져오기
      fetchData()
    } catch (error) {
      console.error('댓글 작성 실패:', error)
    }
  }

  /**
   * 의견 작성 처리 (찬성/반대)
   * 
   * 비로그인 사용자는 로그인 페이지로 이동하고,
   * 로그인한 사용자는 토론에 대한 의견(찬성 또는 반대)을 작성합니다.
   * 
   * @param {string} side - 의견 방향 ('FOR' 또는 'AGAINST')
   */
  const handleCreateOpinion = async (side) => {
    if (!isAuthenticated) {
      navigate('/auth/login')
      return
    }

    try {
      await opinionService.createOpinion({
        debateId: parseInt(id),
        side,
        content: opinionContent || null,
      })
      setSelectedSide(null)
      setOpinionContent('')
      // 의견 목록 업데이트를 위해 데이터 다시 가져오기
      fetchData()
    } catch (error) {
      console.error('입장 선택 실패:', error)
    }
  }

  /**
   * 토론 삭제 처리
   * 
   * 작성자만 삭제할 수 있으며, 토론이 시작되기 전(SCHEDULED 상태)에만 삭제 가능합니다.
   */
  const handleDelete = async () => {
    if (!window.confirm('정말 삭제하시겠습니까?')) return

    try {
      await debateService.deleteDebate(id)
      // 삭제 성공 시 토론 목록 페이지로 이동
      navigate('/debate')
    } catch (error) {
      console.error('삭제 실패:', error)
    }
  }

  /**
   * 목록으로 돌아가기
   * 이전 목록의 필터 조건을 유지하여 목록 페이지로 이동합니다.
   */
  const handleBackToList = () => {
    // location.state에서 필터 조건 가져오기
    const filterState = location.state || {}
    
    // 필터 조건을 state로 전달하여 목록 페이지로 이동
    navigate('/debate', { 
      state: {
        categoryId: filterState.categoryId || '',
        status: filterState.status || '',
        sort: filterState.sort || 'latest',
        keyword: filterState.keyword || ''
      }
    })
  }

  if (loading) {
    return <div className="container">로딩 중...</div>
  }

  if (error || !debate) {
    return (
      <div className="container">
        <div className="error-message" style={{ padding: '2rem', textAlign: 'center' }}>
          <h2>토론을 찾을 수 없습니다</h2>
          <p>{error || '요청하신 토론이 존재하지 않거나 삭제되었습니다.'}</p>
          <button 
            onClick={handleBackToList}
            className="btn btn-primary"
            style={{ marginTop: '1rem' }}
          >
            목록으로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  const isOwner = user && debate && user.id === debate.userId
  const canEdit = isOwner && debate.status === 'SCHEDULED'
  const canVote = debate.status === 'ACTIVE' && isAuthenticated

  const forCount = opinions.filter((o) => o.side === 'FOR').length
  const againstCount = opinions.filter((o) => o.side === 'AGAINST').length
  const totalCount = forCount + againstCount
  const forPercent = totalCount > 0 ? Math.round((forCount / totalCount) * 100) : 0
  const againstPercent = totalCount > 0 ? Math.round((againstCount / totalCount) * 100) : 0

  return (
    <div className="debate-detail-page">
      <div className="container">
        {/* 토론 상세 정보 */}
        <article className="debate-detail">
          <div className="debate-detail-header">
            <div className="debate-meta-top">
              {debate.categoryName && (
                <span className="category-badge">{debate.categoryName}</span>
              )}
              <span className={`status-badge status-${debate.status?.toLowerCase()}`}>
                {debate.status === 'ACTIVE' ? '진행중' : debate.status === 'SCHEDULED' ? '예정' : '종료'}
              </span>
              <span className="period-badge">
                {format(new Date(debate.startDate), 'yyyy-MM-dd')} ~{' '}
                {format(new Date(debate.endDate), 'yyyy-MM-dd')}
              </span>
            </div>
            <h1 className="debate-detail-title">{debate.title}</h1>
            <div className="debate-author-info">
              <div className="author-avatar">👤</div>
              <div className="author-details">
                <Link to={`/users/${debate.userId}`} className="author-name">
                  {debate.nickname || '알 수 없음'}
                </Link>
                <span className="author-date">
                  {format(new Date(debate.createdAt), 'yyyy-MM-dd HH:mm')}
                </span>
              </div>
              {isOwner && (
                <div className="debate-actions">
                  {canEdit && (
                    <>
                      <Link to={`/debate/${id}/edit`} className="btn-icon">
                        ✏️ 수정
                      </Link>
                      <button onClick={handleDelete} className="btn-icon">
                        🗑️ 삭제
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          <div 
            className="debate-detail-content"
            dangerouslySetInnerHTML={{ __html: debate.content }}
          />

          <div className="debate-stats-detail">
            <div className="stat-item">
              <span className="stat-label">조회수</span>
              <span className="stat-value">{debate.viewCount || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">좋아요</span>
              <span className="stat-value">{debate.likeCount || 0}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">댓글</span>
              <span className="stat-value">{debate.commentCount || 0}</span>
            </div>
          </div>

          <div className="debate-interactions">
            <button
              onClick={handleLike}
              className={`btn ${isLiked ? 'btn-primary' : 'btn-outline'}`}
            >
              👍 좋아요 ({debate.likeCount || 0})
            </button>
            <button
              onClick={handleBackToList}
              className="btn btn-outline back-to-list-btn"
            >
              ← 목록으로
            </button>
          </div>
        </article>

        {/* 투표 섹션 */}
        {canVote && (
          <section className="vote-section">
            <h2>당신의 입장을 선택하세요</h2>
            <div className="vote-options">
              <div className="vote-option vote-for-option">
                <h3>찬성</h3>
                <p>AI는 인간의 일자리를 대체할 것입니다.</p>
                <button
                  className="btn btn-primary"
                  style={{ width: '100%' }}
                  onClick={() => handleCreateOpinion('FOR')}
                >
                  찬성 선택
                </button>
                <div className="vote-result">
                  <div className="vote-bar">
                    <div
                      className="vote-bar-fill vote-for"
                      style={{ width: `${forPercent}%` }}
                    ></div>
                  </div>
                  <p className="vote-percentage">
                    {forPercent}% ({forCount}명)
                  </p>
                </div>
              </div>
              <div className="vote-option vote-against-option">
                <h3>반대</h3>
                <p>AI는 새로운 일자리를 창출할 것입니다.</p>
                <button
                  className="btn btn-danger"
                  style={{ width: '100%' }}
                  onClick={() => handleCreateOpinion('AGAINST')}
                >
                  반대 선택
                </button>
                <div className="vote-result">
                  <div className="vote-bar">
                    <div
                      className="vote-bar-fill vote-against"
                      style={{ width: `${againstPercent}%` }}
                    ></div>
                  </div>
                  <p className="vote-percentage">
                    {againstPercent}% ({againstCount}명)
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 댓글 섹션 */}
        <section className="comments-section">
          <div className="comments-header">
            <h2>댓글 ({debate.commentCount || 0})</h2>
          </div>

          {isAuthenticated && (
            <form onSubmit={handleCreateComment} className="comment-form">
              <textarea
                className="form-textarea"
                placeholder="댓글을 입력하세요..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                required
              />
              <div className="comment-form-actions">
                <button type="submit" className="btn btn-primary">
                  등록
                </button>
                <button
                  type="button"
                  onClick={() => setCommentContent('')}
                  className="btn btn-outline"
                >
                  취소
                </button>
              </div>
            </form>
          )}

          <div className="comments-list">
            {comments.map((comment) => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <div className="comment-author">
                    <div className="author-avatar-small">👤</div>
                    <div>
                      <Link to={`/users/${comment.userId}`} className="comment-author-name">
                        {comment.nickname || '알 수 없음'}
                      </Link>
                      <span className="comment-date">
                        {format(new Date(comment.createdAt), 'yyyy-MM-dd HH:mm')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="comment-content">
                  <p>{comment.content}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

export default DebateDetailPage

