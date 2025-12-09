/**
 * UserProfilePage 컴포넌트
 * 
 * 특정 사용자의 프로필 페이지입니다.
 * 
 * 주요 기능:
 * - 사용자 프로필 정보 표시 (닉네임, 프로필 이미지, 소개)
 * - 사용자 통계 정보 표시 (토론 수, 댓글 수, 좋아요 수)
 * - 작성한 토론 / 작성한 댓글 탭으로 분리
 * - 쪽지 보내기 / 신고하기 기능
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { userService } from '../services/userService'
import { reportService } from '../services/reportService'
import { useAuth } from '../context/AuthContext'
import api from '../services/api'
import UserAvatar from '../components/common/UserAvatar'
import { format } from 'date-fns'
import './UserProfilePage.css'

const UserProfilePage = () => {
  const navigate = useNavigate()
  const { userId } = useParams()
  const { user, isAuthenticated } = useAuth()

  // 상태 관리
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('debates')

  // 쪽지 팝업
  const [dmPopup, setDmPopup] = useState(false)
  const [dmMessage, setDmMessage] = useState('')
  const [dmSending, setDmSending] = useState(false)

  // 토론/댓글 데이터
  const [debates, setDebates] = useState([])
  const [debatesPage, setDebatesPage] = useState(0)
  const [debatesTotalPages, setDebatesTotalPages] = useState(0)
  const [debatesLoading, setDebatesLoading] = useState(false)

  const [comments, setComments] = useState([])
  const [commentsPage, setCommentsPage] = useState(0)
  const [commentsTotalPages, setCommentsTotalPages] = useState(0)
  const [commentsLoading, setCommentsLoading] = useState(false)

  // 내 프로필인지 확인
  const isMyProfile = user && String(user.id) === String(userId)

  useEffect(() => {
    fetchProfile()
  }, [userId])

  useEffect(() => {
    if (profile) {
      if (activeTab === 'debates' && debates.length === 0) {
        fetchDebates(0)
      } else if (activeTab === 'comments' && comments.length === 0) {
        fetchComments(0)
      }
    }
  }, [activeTab, profile])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await userService.getUserById(userId)
      const data = response.data || response
      setProfile(data)
      fetchDebates(0)
    } catch (error) {
      console.error('프로필 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDebates = async (page) => {
    try {
      setDebatesLoading(true)
      const response = await userService.getUserDebates(userId, page, 10)
      const data = response.data || response
      setDebates(data.content || [])
      setDebatesPage(data.number || 0)
      setDebatesTotalPages(data.totalPages || 0)
    } catch (error) {
      console.error('토론 목록 로딩 실패:', error)
    } finally {
      setDebatesLoading(false)
    }
  }

  const fetchComments = async (page) => {
    try {
      setCommentsLoading(true)
      const response = await userService.getUserComments(userId, page, 10)
      const data = response.data || response
      setComments(data.content || [])
      setCommentsPage(data.number || 0)
      setCommentsTotalPages(data.totalPages || 0)
    } catch (error) {
      console.error('댓글 목록 로딩 실패:', error)
    } finally {
      setCommentsLoading(false)
    }
  }

  /**
   * 쪽지 전송
   */
  const handleSendDM = async (e) => {
    e.preventDefault()
    if (!dmMessage.trim() || !profile?.nickname) return

    setDmSending(true)
    try {
      await api.post('/messages', {
        receiverNickname: profile.nickname,
        content: dmMessage.trim()
      })
      alert('쪽지를 보냈습니다.')
      setDmPopup(false)
      setDmMessage('')
    } catch (err) {
      alert('쪽지 전송에 실패했습니다.')
    }
    setDmSending(false)
  }

  /**
   * 사용자 신고
   */
  const handleReport = async () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.')
      return
    }

    const reason = prompt(`${profile.nickname}님을 신고하는 사유를 입력해주세요:`)
    if (!reason) return

    try {
      await reportService.createReport({
        targetType: 'USER',
        targetId: userId,
        reason,
        description: `사용자 신고: ${profile.nickname}`
      })
      alert('신고가 접수되었습니다.')
    } catch {
      alert('신고 처리에 실패했습니다.')
    }
  }

  const stripHtml = (html) => {
    if (!html) return ''
    const tmp = document.createElement('DIV')
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ''
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    try {
      return format(new Date(dateStr), 'yyyy-MM-dd')
    } catch {
      return ''
    }
  }

  if (loading) {
    return (
      <div className="user-profile-page">
        <div className="container">
          <div className="profile-loading">로딩 중...</div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="user-profile-page">
        <div className="container">
          <div className="profile-not-found">사용자를 찾을 수 없습니다.</div>
        </div>
      </div>
    )
  }

  return (
    <div className="user-profile-page">
      <div className="container">
        {/* 프로필 헤더 섹션 */}
        <div className="profile-section">
          <div className="profile-header">
            <div className="profile-avatar">
              <UserAvatar
                src={profile.profileImage}
                alt={profile.nickname || '이름 없음'}
                size="large"
              />
            </div>
            <div className="profile-info">
              <h1>{profile.nickname || '이름 없음'}</h1>
              {profile.bio && <p className="profile-bio">{profile.bio}</p>}

              {/* 통계 정보 */}
              <div className="profile-stats">
                <div className="stat-item">
                  <span className="stat-value">{profile.debateCount || 0}</span>
                  <span className="stat-label">토론</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{profile.commentCount || 0}</span>
                  <span className="stat-label">댓글</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{profile.likeCount || 0}</span>
                  <span className="stat-label">좋아요</span>
                </div>
              </div>

              {/* 액션 버튼 (내 프로필이 아닌 경우에만 표시) */}
              {!isMyProfile && isAuthenticated && (
                <div className="profile-actions">
                  <button className="action-btn message-btn" onClick={() => setDmPopup(true)}>
                    ✉️ 쪽지 보내기
                  </button>
                  <button className="action-btn report-btn" onClick={handleReport}>
                    🚨 신고하기
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="profile-tabs">
          <button
            className={`profile-tab ${activeTab === 'debates' ? 'active' : ''}`}
            onClick={() => setActiveTab('debates')}
          >
            📝 작성한 토론
          </button>
          <button
            className={`profile-tab ${activeTab === 'comments' ? 'active' : ''}`}
            onClick={() => setActiveTab('comments')}
          >
            💬 작성한 댓글
          </button>
        </div>

        {/* 탭 콘텐츠 */}
        <div className="profile-tab-content">
          {activeTab === 'debates' && (
            <div className="debates-list">
              {debatesLoading ? (
                <div className="tab-loading">로딩 중...</div>
              ) : debates.length === 0 ? (
                <div className="tab-empty">작성한 토론이 없습니다.</div>
              ) : (
                <>
                  {debates.map((debate) => (
                    <Link key={debate.id} to={`/debate/${debate.id}`} className="debate-item">
                      <div className="debate-item-header">
                        <span className="debate-category">{debate.categoryName}</span>
                        <span className={`debate-status status-${debate.status?.toLowerCase()}`}>
                          {debate.status === 'ACTIVE' ? '진행중' : debate.status === 'ENDED' ? '종료' : '예정'}
                        </span>
                      </div>
                      <h3 className="debate-title">{debate.title}</h3>
                      <p className="debate-excerpt">
                        {stripHtml(debate.content).substring(0, 100)}
                        {stripHtml(debate.content).length > 100 && '...'}
                      </p>
                      <div className="debate-meta">
                        <span>{formatDate(debate.createdAt)}</span>
                        <span>👍 {debate.likeCount || 0}</span>
                        <span>💬 {debate.commentCount || 0}</span>
                      </div>
                    </Link>
                  ))}
                  {debatesTotalPages > 1 && (
                    <div className="pagination">
                      <button className="page-btn" disabled={debatesPage === 0} onClick={() => fetchDebates(debatesPage - 1)}>이전</button>
                      <span className="page-info">{debatesPage + 1} / {debatesTotalPages}</span>
                      <button className="page-btn" disabled={debatesPage >= debatesTotalPages - 1} onClick={() => fetchDebates(debatesPage + 1)}>다음</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="comments-list">
              {commentsLoading ? (
                <div className="tab-loading">로딩 중...</div>
              ) : comments.length === 0 ? (
                <div className="tab-empty">작성한 댓글이 없습니다.</div>
              ) : (
                <>
                  {comments.map((comment) => (
                    <Link key={comment.id} to={`/debate/${comment.debateId}`} className="comment-item">
                      <p className="comment-content">{comment.content}</p>
                      <div className="comment-meta">
                        <span>{formatDate(comment.createdAt)}</span>
                        <span>❤️ {comment.likeCount || 0}</span>
                      </div>
                    </Link>
                  ))}
                  {commentsTotalPages > 1 && (
                    <div className="pagination">
                      <button className="page-btn" disabled={commentsPage === 0} onClick={() => fetchComments(commentsPage - 1)}>이전</button>
                      <span className="page-info">{commentsPage + 1} / {commentsTotalPages}</span>
                      <button className="page-btn" disabled={commentsPage >= commentsTotalPages - 1} onClick={() => fetchComments(commentsPage + 1)}>다음</button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 쪽지 보내기 팝업 */}
      {dmPopup && (
        <div className="dm-popup-overlay" onClick={() => setDmPopup(false)}>
          <div className="dm-popup" onClick={(e) => e.stopPropagation()}>
            <div className="dm-popup-header">
              <h3>✉️ {profile.nickname}님에게 쪽지</h3>
              <button className="dm-popup-close" onClick={() => setDmPopup(false)}>✕</button>
            </div>
            <form onSubmit={handleSendDM}>
              <textarea
                className="dm-popup-textarea"
                placeholder="쪽지 내용을 입력하세요..."
                value={dmMessage}
                onChange={(e) => setDmMessage(e.target.value)}
                maxLength={500}
                rows={4}
                autoFocus
              />
              <div className="dm-popup-actions">
                <button type="button" className="dm-popup-cancel" onClick={() => setDmPopup(false)}>취소</button>
                <button type="submit" className="dm-popup-send" disabled={!dmMessage.trim() || dmSending}>
                  {dmSending ? '전송 중...' : '보내기'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfilePage
