/**
 * MyPage 컴포넌트 - 개선된 버전
 * 
 * 변경사항:
 * - 말풍선 컨셉을 반영한 프로필 카드
 * - 입체감 있는 아바타 디자인
 * - 아이콘이 추가된 통계 카드
 * - 애니메이션이 적용된 토론 항목
 * - 부드러운 인터랙션
 */

import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/userService'
import { myPageService } from '../services/myPageService'
import { messageService } from '../services/messageService'
import { Link } from 'react-router-dom'
import './MyPage.css'
import '../styles/MessageBox.css'

const MyPage = () => {
  const { user } = useAuth()

  // 상태 관리
  const [profile, setProfile] = useState(null)
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [myDebates, setMyDebates] = useState([])
  const [participatedDebates, setParticipatedDebates] = useState([])
  const [myComments, setMyComments] = useState([])
  const [likedDebates, setLikedDebates] = useState([])
  const [loadingData, setLoadingData] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isMoreMenuModalOpen, setIsMoreMenuModalOpen] = useState(false)

  // 쪽지 관련 상태
  const [messages, setMessages] = useState([])
  const [messageTab, setMessageTab] = useState('received')
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false)
  const [isMessageComposeModalOpen, setIsMessageComposeModalOpen] = useState(false)
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [messageForm, setMessageForm] = useState({ receiverNickname: '', content: '' })
  const [unreadMessageCount, setUnreadMessageCount] = useState(0)
  const [sendingMessage, setSendingMessage] = useState(false)

  // 초기 로딩
  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchMyDebates()
      fetchUnreadMessageCount()
    }
  }, [user])

  // URL 쿼리 파라미터로 탭 변경
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)

      if (tab === 'my-debate') {
        fetchMyDebates()
      } else if (tab === 'participated') {
        fetchParticipatedDebates()
      } else if (tab === 'comments') {
        fetchMyComments()
      } else if (tab === 'likes') {
        fetchLikedDebates()
      } else if (tab === 'messages') {
        setMessageTab('received')  // 쪽지 탭 초기화
      }
    }
  }, [searchParams])

  // messageTab 변경 시 쪽지 목록 fetch
  useEffect(() => {
    if (activeTab === 'messages' && user) {
      fetchMessages()
    }
  }, [messageTab, activeTab, user])

  // 데이터 fetch 함수들
  const fetchProfile = async () => {
    try {
      const response = await userService.getUserById(user.id)
      const data = response.data || response
      setProfile(data)
    } catch (error) {
      console.error('프로필 로딩 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyDebates = async () => {
    if (!user) return
    setLoadingData(true)
    try {
      const response = await myPageService.getMyDebates(0, 100)
      const pageData = response.data || response
      const content = pageData.content || []
      setMyDebates(Array.isArray(content) ? content : [])
    } catch (error) {
      console.error('내 토론 목록 로딩 실패:', error)
      setMyDebates([])
    } finally {
      setLoadingData(false)
    }
  }

  const fetchParticipatedDebates = async () => {
    if (!user) return
    setLoadingData(true)
    try {
      const response = await myPageService.getMyOpinions()
      const data = response.data || response
      const opinions = Array.isArray(data) ? data : []
      console.log('참여한 토론 원본 데이터:', opinions)

      // API 응답에서 토론 정보를 직접 사용
      const debates = opinions.map(opinion => ({
        id: opinion.debateId,
        title: opinion.debateTitle || '제목 없음',
        categoryName: opinion.categoryName || '카테고리',
        status: opinion.debateStatus || 'ACTIVE',
        side: opinion.side,
        createdAt: opinion.createdAt
      })).filter(debate => debate.id)
      console.log('참여한 토론 필터 후:', debates)

      setParticipatedDebates(debates)
    } catch (error) {
      console.error('참여한 토론 목록 로딩 실패:', error)
      setParticipatedDebates([])
    } finally {
      setLoadingData(false)
    }
  }

  const fetchMyComments = async () => {
    if (!user) return
    setLoadingData(true)
    try {
      const response = await myPageService.getMyComments(0, 100)
      const pageData = response.data || response
      const content = pageData.content || []
      setMyComments(Array.isArray(content) ? content : [])
    } catch (error) {
      console.error('내 댓글 목록 로딩 실패:', error)
      setMyComments([])
    } finally {
      setLoadingData(false)
    }
  }

  const fetchLikedDebates = async () => {
    if (!user) return
    setLoadingData(true)
    try {
      const response = await myPageService.getMyLikedDebates(0, 100)
      const pageData = response.data || response
      const content = pageData.content || []
      console.log('받은 좋아요 원본 데이터:', pageData)
      console.log('받은 좋아요 content:', content)
      setLikedDebates(Array.isArray(content) ? content : [])
    } catch (error) {
      console.error('받은 좋아요 목록 로딩 실패:', error)
      setLikedDebates([])
    } finally {
      setLoadingData(false)
    }
  }

  const fetchMessages = async () => {
    if (!user) return
    setLoadingData(true)
    try {
      const response = messageTab === 'received'
        ? await messageService.getReceivedMessages(0, 20)
        : await messageService.getSentMessages(0, 20)

      const pageData = response.data || response
      const content = pageData.content || []
      setMessages(Array.isArray(content) ? content : [])
    } catch (error) {
      console.error('쪽지 목록 로딩 실패:', error)
      setMessages([])
    } finally {
      setLoadingData(false)
    }
  }

  const fetchUnreadMessageCount = async () => {
    if (!user) return
    try {
      const response = await messageService.getUnreadCount()
      setUnreadMessageCount(response.data || response)
    } catch (error) {
      console.error('안 읽은 쪽지 개수 로딩 실패:', error)
    }
  }

  const handleTabChange = (tab) => {
    setActiveTab(tab)

    if (tab === 'my-debate') {
      fetchMyDebates()
    } else if (tab === 'participated') {
      fetchParticipatedDebates()
    } else if (tab === 'comments') {
      fetchMyComments()
    } else if (tab === 'likes') {
      fetchLikedDebates()
    } else if (tab === 'messages') {
      setMessageTab('received')  // 쪽지 탭 초기화
    }
  }

  const formatRelativeTime = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '방금 전'
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    if (days < 7) return `${days}일 전`
    return date.toLocaleDateString('ko-KR')
  }

  const getSideLabel = (side) => {
    switch (side) {
      case 'FOR': return '찬성'
      case 'AGAINST': return '반대'
      case 'NEUTRAL': return '중립'
      case 'OTHER': return '기타'
      default: return side
    }
  }
  // 쪽지 보내기
  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!messageForm.receiverNickname.trim() || !messageForm.content.trim()) {
      alert('받는 사람과 내용을 모두 입력해주세요')
      return
    }

    setSendingMessage(true)
    try {
      await messageService.sendMessage(messageForm.receiverNickname, messageForm.content)
      setMessageForm({ receiverNickname: '', content: '' })
      setIsMessageComposeModalOpen(false)
      fetchMessages()
      fetchUnreadMessageCount()
      alert('쪽지가 성공적으로 전송되었습니다!')
    } catch (error) {
      console.error('쪽지 전송 실패:', error)
      alert(error.response?.data?.message || '쪽지 전송에 실패했습니다')
    } finally {
      setSendingMessage(false)
    }
  }

  // 쪽지 읽기 (읽음 처리)
  const handleReadMessage = async (message) => {
    setSelectedMessage(message)
    setIsMessageModalOpen(true)

    // 받은 쪽지이고 안 읽은 경우에만 읽음 처리
    if (messageTab === 'received' && !message.isRead) {
      try {
        await messageService.readMessage(message.id)
        fetchMessages()
        fetchUnreadMessageCount()
      } catch (error) {
        console.error('쪽지 읽음 처리 실패:', error)
      }
    }
  }

  // 답장하기
  const handleReply = (message) => {
    setMessageForm({
      receiverNickname: message.senderNickname || '',
      content: ''
    })
    setIsMessageModalOpen(false)
    setSelectedMessage(null)
    setIsMessageComposeModalOpen(true)
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'ACTIVE': return '진행중'
      case 'ENDED': return '종료됨'
      case 'SCHEDULED': return '예정됨'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <div className="loading-spinner"></div>
        <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>로딩 중...</p>
      </div>
    )
  }

  return (
    <div className="my-page">
      <div className="container">
        <div className="my-page-layout">
          {/* 사이드바 (데스크톱만 표시) */}
          <aside className="my-page-sidebar">
            {profile && (
              <>
                {/* 프로필 카드 */}
                <div className="profile-card">
                  <div className="profile-avatar">
                    {profile.profileImage ? (
                      <img src={profile.profileImage} alt={profile.nickname} />
                    ) : (
                      <span>👤</span>
                    )}
                  </div>
                  <h2 className="profile-name">{profile.nickname || '이름 없음'}</h2>
                  <p className="profile-bio">{profile.bio || '자기소개를 입력하세요'}</p>

                  {/* 통계 */}
                  <div className="profile-stats">
                    <button
                      className="stat-item stat-item-clickable"
                      onClick={() => handleTabChange('my-debate')}
                      title="작성한 토론 보기"
                    >
                      <span className="stat-value">{profile.debateCount ?? 0}</span>
                      <span className="stat-label">작성한 토론</span>
                    </button>
                    <button
                      className="stat-item stat-item-clickable"
                      onClick={() => handleTabChange('participated')}
                      title="참여한 토론 보기"
                    >
                      <span className="stat-value">{profile.participatedCount ?? 0}</span>
                      <span className="stat-label">참여한 토론</span>
                    </button>
                    <button
                      className="stat-item stat-item-clickable"
                      onClick={() => handleTabChange('likes')}
                      title="받은 좋아요 보기"
                    >
                      <span className="stat-value">{profile.likeCount ?? 0}</span>
                      <span className="stat-label">받은 좋아요</span>
                    </button>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="profile-actions">
                    <Link to="/my/edit" className="btn btn-primary">
                      프로필 수정
                    </Link>
                    <Link to="/my/settings" className="btn btn-outline">
                      계정 설정
                    </Link>
                  </div>
                </div>

                {/* 네비게이션 */}
                <nav className="my-page-nav">
                  <button
                    onClick={() => handleTabChange('dashboard')}
                    className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                  >
                    📊 대시보드
                  </button>
                  <button
                    onClick={() => handleTabChange('my-debate')}
                    className={`nav-item ${activeTab === 'my-debate' ? 'active' : ''}`}
                  >
                    📝 내 토론
                  </button>
                  <button
                    onClick={() => handleTabChange('participated')}
                    className={`nav-item ${activeTab === 'participated' ? 'active' : ''}`}
                  >
                    🏆 참여한 토론
                  </button>
                  <button
                    onClick={() => handleTabChange('comments')}
                    className={`nav-item ${activeTab === 'comments' ? 'active' : ''}`}
                  >
                    💬 내 댓글
                  </button>
                  <button
                    onClick={() => handleTabChange('likes')}
                    className={`nav-item ${activeTab === 'likes' ? 'active' : ''}`}
                  >
                    👍 받은 좋아요
                  </button>
                  <button
                    onClick={() => handleTabChange('bookmarks')}
                    className={`nav-item ${activeTab === 'bookmarks' ? 'active' : ''}`}
                  >
                    🔖 북마크
                  </button>
                  <button
                    onClick={() => handleTabChange('messages')}
                    className={`nav-item ${activeTab === 'messages' ? 'active' : ''}`}
                  >
                    📮 우편함
                    {unreadMessageCount > 0 && (
                      <span className="badge-count">{unreadMessageCount}</span>
                    )}
                  </button>
                  <button
                    onClick={() => handleTabChange('activity')}
                    className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
                  >
                    📋 활동 내역
                  </button>
                </nav>
              </>
            )}
          </aside>

          {/* 메인 콘텐츠 */}
          <div className="my-page-content">
            {/* 대시보드 탭 */}
            {activeTab === 'dashboard' && profile && (
              <>
                <div className="page-header">
                  <h1>대시보드</h1>
                  <p className="page-description">나의 활동을 한눈에 확인하세요</p>
                </div>

                {/* 통계 그리드 */}
                <div className="stats-grid">
                  <button
                    className="stat-card stat-card-clickable"
                    onClick={() => handleTabChange('my-debate')}
                  >
                    <div className="stat-icon">📝</div>
                    <div className="stat-info">
                      <span className="stat-number">{profile.debateCount ?? 0}</span>
                      <span className="stat-label">작성한 토론</span>
                    </div>
                  </button>

                  <button
                    className="stat-card stat-card-clickable"
                    onClick={() => handleTabChange('participated')}
                  >
                    <div className="stat-icon">🏆</div>
                    <div className="stat-info">
                      <span className="stat-number">{profile.participatedCount ?? 0}</span>
                      <span className="stat-label">참여한 토론</span>
                    </div>
                  </button>

                  <button
                    className="stat-card stat-card-clickable"
                    onClick={() => handleTabChange('comments')}
                  >
                    <div className="stat-icon">💬</div>
                    <div className="stat-info">
                      <span className="stat-number">{profile.commentCount ?? 0}</span>
                      <span className="stat-label">작성한 댓글</span>
                    </div>
                  </button>

                  <button
                    className="stat-card stat-card-clickable"
                    onClick={() => handleTabChange('likes')}
                  >
                    <div className="stat-icon">👍</div>
                    <div className="stat-info">
                      <span className="stat-number">{profile.likeCount ?? 0}</span>
                      <span className="stat-label">받은 좋아요</span>
                    </div>
                  </button>
                </div>

                {/* 최근 활동 */}
                {myDebates.length > 0 && (
                  <div className="section">
                    <h2>최근 작성한 토론</h2>
                    <div className="my-debate-list">
                      {myDebates.slice(0, 3).map((debate) => (
                        <Link
                          key={debate.id}
                          to={`/debate/${debate.id}`}
                          className="my-debate-item-link"
                        >
                          <div className="my-debate-item">
                            <div className="debate-item-header">
                              <span className="category-badge">
                                {debate.categoryName || '카테고리'}
                              </span>
                              <span className={`status-badge status-${debate.status?.toLowerCase()}`}>
                                {getStatusLabel(debate.status)}
                              </span>
                            </div>
                            <h3>{debate.title}</h3>
                            <div className="debate-item-meta">
                              <span className="stat">
                                👁️ {debate.viewCount ?? 0} · 💬 {debate.commentCount ?? 0}
                              </span>
                              <span className="date">{formatRelativeTime(debate.createdAt)}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* 내 토론 탭 */}
            {activeTab === 'my-debate' && (
              <>
                <div className="page-header">
                  <h1>내 토론</h1>
                  <p className="page-description">
                    내가 작성한 토론 목록입니다
                    {profile && profile.debateCount > 0 && ` (총 ${profile.debateCount}개)`}
                  </p>
                </div>

                {loadingData ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <div className="loading-spinner"></div>
                  </div>
                ) : myDebates.length > 0 ? (
                  <div className="my-debate-list">
                    {myDebates.map((debate) => (
                      <Link
                        key={debate.id}
                        to={`/debate/${debate.id}`}
                        className="my-debate-item-link"
                      >
                        <div className="my-debate-item">
                          <div className="debate-item-header">
                            <span className="category-badge">
                              {debate.categoryName || '카테고리'}
                            </span>
                            <span className={`status-badge status-${debate.status?.toLowerCase()}`}>
                              {getStatusLabel(debate.status)}
                            </span>
                          </div>
                          <h3>{debate.title}</h3>
                          <div className="debate-item-meta">
                            <span className="stat">
                              👁️ {debate.viewCount ?? 0} · 💬 {debate.commentCount ?? 0}
                            </span>
                            <span className="date">{formatRelativeTime(debate.createdAt)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">
                    작성한 토론이 없습니다
                  </div>
                )}
              </>
            )}

            {/* 참여한 토론 탭 */}
            {activeTab === 'participated' && (
              <>
                <div className="page-header">
                  <h1>참여한 토론</h1>
                  <p className="page-description">입장을 선택한 토론 목록입니다</p>
                </div>

                {loadingData ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <div className="loading-spinner"></div>
                  </div>
                ) : participatedDebates.length > 0 ? (
                  <div className="my-debate-list">
                    {participatedDebates.map((debate) => (
                      <Link
                        key={debate.id}
                        to={`/debate/${debate.id}`}
                        className="my-debate-item-link"
                      >
                        <div className="my-debate-item">
                          <div className="debate-item-header">
                            <span className="category-badge">
                              {debate.categoryName || '카테고리'}
                            </span>
                            <span className="side-badge">
                              {getSideLabel(debate.side)}
                            </span>
                            <span className={`status-badge status-${debate.status?.toLowerCase()}`}>
                              {getStatusLabel(debate.status)}
                            </span>
                          </div>
                          <h3>{debate.title}</h3>
                          <div className="debate-item-meta">
                            <span className="date">{formatRelativeTime(debate.createdAt)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">
                    참여한 토론이 없습니다
                  </div>
                )}
              </>
            )}
            {/* 내 댓글 탭 */}
            {activeTab === 'comments' && (
              <>
                <div className="page-header">
                  <h1>내 댓글</h1>
                  <p className="page-description">내가 작성한 댓글 목록입니다</p>
                </div>

                {loadingData ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <div className="loading-spinner"></div>
                  </div>
                ) : myComments.length > 0 ? (
                  <div className="my-debate-list">
                    {myComments.map((comment) => (
                      <Link
                        key={comment.id}
                        to={`/debate/${comment.debateId}`}
                        className="my-debate-item-link"
                      >
                        <div className="my-debate-item">
                          <div className="debate-item-header">
                            <span className="category-badge">
                              {comment.debateTitle || '토론'}
                            </span>
                          </div>
                          <p style={{ marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                            {comment.content}
                          </p>
                          <div className="debate-item-meta">
                            <span className="stat">
                              👍 {comment.likeCount ?? 0}
                            </span>
                            <span className="date">{formatRelativeTime(comment.createdAt)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">
                    작성한 댓글이 없습니다
                  </div>
                )}
              </>
            )}

            {/* 받은 좋아요 탭 */}
            {activeTab === 'likes' && (
              <>
                <div className="page-header">
                  <h1>받은 좋아요</h1>
                  <p className="page-description">내 토론이 받은 좋아요 목록입니다</p>
                </div>

                {loadingData ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <div className="loading-spinner"></div>
                  </div>
                ) : likedDebates.length > 0 ? (
                  <div className="my-debate-list">
                    {likedDebates.map((debate) => (
                      <Link
                        key={debate.id}
                        to={`/debate/${debate.id}`}
                        className="my-debate-item-link"
                      >
                        <div className="my-debate-item">
                          <div className="debate-item-header">
                            <span className="category-badge">
                              {debate.categoryName || '카테고리'}
                            </span>
                            <span className={`status-badge status-${debate.status?.toLowerCase()}`}>
                              {getStatusLabel(debate.status)}
                            </span>
                          </div>
                          <h3>{debate.title}</h3>
                          <div className="debate-item-meta">
                            <span className="stat">
                              👍 {debate.likeCount ?? 0} · 👁️ {debate.viewCount ?? 0} · 💬 {debate.commentCount ?? 0}
                            </span>
                            <span className="date">{formatRelativeTime(debate.createdAt)}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">
                    받은 좋아요가 없습니다
                  </div>
                )}
              </>
            )}

            {/* 북마크 탭 */}
            {activeTab === 'bookmarks' && (
              <>
                <div className="page-header">
                  <h1>북마크</h1>
                  <p className="page-description">북마크한 토론 목록입니다</p>
                </div>

                <div className="no-data">
                  북마크 기능은 준비 중입니다
                </div>
              </>
            )}

            {/* 우편함 탭 */}
            {activeTab === 'messages' && (
              <>
                <div className="page-header">
                  <h1>우편함</h1>
                  <p className="page-description">받은 쪽지와 보낸 쪽지를 확인하세요</p>
                </div>

                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => {
                        setMessageTab('received')
                        fetchMessages()
                      }}
                      className={`btn ${messageTab === 'received' ? 'btn-primary' : 'btn-outline'}`}
                    >
                      📨 받은 쪽지
                    </button>
                    <button
                      onClick={() => {
                        setMessageTab('sent')
                        fetchMessages()
                      }}
                      className={`btn ${messageTab === 'sent' ? 'btn-primary' : 'btn-outline'}`}
                    >
                      📤 보낸 쪽지
                    </button>
                  </div>
                  <button
                    onClick={() => setIsMessageComposeModalOpen(true)}
                    className="btn btn-primary"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    ✉️ 쪽지 보내기
                  </button>
                </div>
                {loadingData ? (
                  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <div className="loading-spinner"></div>
                  </div>
                ) : messages.length > 0 ? (
                  <div className="my-debate-list">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className="my-debate-item"
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleReadMessage(message)}                      >
                        <div className="debate-item-header">
                          <span className="category-badge">
                            {messageTab === 'received'
                              ? `보낸 사람: ${message.senderNickname || '알 수 없음'}`
                              : `받는 사람: ${message.receiverNickname || '알 수 없음'}`
                            }
                          </span>
                          {!message.isRead && messageTab === 'received' && (
                            <span className="status-badge" style={{ background: 'var(--primary-color)' }}>
                              새 쪽지
                            </span>
                          )}
                        </div>
                        <p style={{ marginTop: '0.5rem', color: 'var(--text-primary)' }}>
                          {message.content}
                        </p>
                        <div className="debate-item-meta">
                          <span className="date">{formatRelativeTime(message.createdAt)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data">
                    {messageTab === 'received' ? '받은 쪽지가 없습니다' : '보낸 쪽지가 없습니다'}
                  </div>
                )}
              </>
            )}

            {/* 활동 내역 탭 */}
            {activeTab === 'activity' && (
              <>
                <div className="page-header">
                  <h1>활동 내역</h1>
                  <p className="page-description">나의 모든 활동을 확인하세요</p>
                </div>

                <div className="no-data">
                  활동 내역 기능은 준비 중입니다
                </div>
              </>
            )}
          </div>
        </div>

        {/* 모바일 하단 네비게이션 */}
        <nav className="mobile-bottom-nav">
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="mobile-nav-item mobile-nav-item-profile"
          >
            <span className="mobile-nav-icon">👤</span>
            <span className="mobile-nav-label">프로필</span>
          </button>
          <button
            onClick={() => handleTabChange('dashboard')}
            className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">📊</span>
            <span className="mobile-nav-label">대시보드</span>
          </button>
          <button
            onClick={() => handleTabChange('my-debate')}
            className={`mobile-nav-item ${activeTab === 'my-debate' ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">📝</span>
            <span className="mobile-nav-label">내 토론</span>
          </button>
          <button
            onClick={() => handleTabChange('participated')}
            className={`mobile-nav-item ${activeTab === 'participated' ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">🏆</span>
            <span className="mobile-nav-label">참여</span>
          </button>
          <button
            onClick={() => setIsMoreMenuModalOpen(true)}
            className="mobile-nav-item mobile-nav-item-more"
          >
            <span className="mobile-nav-icon">⋯</span>
            <span className="mobile-nav-label">더보기</span>
          </button>
        </nav>

        {/* 프로필 모달 (모바일) */}
        {isProfileModalOpen && profile && (
          <>
            <div
              className="profile-modal-overlay"
              onClick={() => setIsProfileModalOpen(false)}
            ></div>
            <div className="profile-modal">
              <div className="profile-modal-header">
                <h2>프로필</h2>
                <button
                  className="profile-modal-close"
                  onClick={() => setIsProfileModalOpen(false)}
                  aria-label="닫기"
                >
                  ✕
                </button>
              </div>
              <div className="profile-modal-content">
                <div className="profile-modal-avatar">
                  {profile.profileImage ? (
                    <img src={profile.profileImage} alt={profile.nickname} />
                  ) : (
                    '👤'
                  )}
                </div>
                <h2 className="profile-modal-name">{profile.nickname || '이름 없음'}</h2>
                {profile.bio && <p className="profile-modal-bio">{profile.bio}</p>}

                <div className="profile-modal-stats">
                  <button
                    className="profile-modal-stat-item"
                    onClick={() => {
                      setIsProfileModalOpen(false)
                      handleTabChange('my-debate')
                    }}
                  >
                    <span className="profile-modal-stat-value">{profile.debateCount ?? 0}</span>
                    <span className="profile-modal-stat-label">작성한 토론</span>
                  </button>
                  <button
                    className="profile-modal-stat-item"
                    onClick={() => {
                      setIsProfileModalOpen(false)
                      handleTabChange('participated')
                    }}
                  >
                    <span className="profile-modal-stat-value">{profile.participatedCount ?? 0}</span>
                    <span className="profile-modal-stat-label">참여한 토론</span>
                  </button>
                  <button
                    className="profile-modal-stat-item"
                    onClick={() => {
                      setIsProfileModalOpen(false)
                      handleTabChange('likes')
                    }}
                  >
                    <span className="profile-modal-stat-value">{profile.likeCount ?? 0}</span>
                    <span className="profile-modal-stat-label">받은 좋아요</span>
                  </button>
                </div>

                <div className="profile-modal-actions">
                  <Link
                    to="/my/edit"
                    className="btn btn-primary"
                    onClick={() => setIsProfileModalOpen(false)}
                  >
                    프로필 수정
                  </Link>
                  <Link
                    to="/my/settings"
                    className="btn btn-outline"
                    onClick={() => setIsProfileModalOpen(false)}
                  >
                    계정 설정
                  </Link>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 더보기 메뉴 모달 (모바일) */}
        {isMoreMenuModalOpen && (
          <>
            <div
              className="more-menu-modal-overlay"
              onClick={() => setIsMoreMenuModalOpen(false)}
            ></div>
            <div className="more-menu-modal">
              <div className="more-menu-modal-header">
                <h2>더보기</h2>
                <button
                  className="more-menu-modal-close"
                  onClick={() => setIsMoreMenuModalOpen(false)}
                  aria-label="닫기"
                >
                  ✕
                </button>
              </div>
              <div className="more-menu-modal-content">
                <nav className="more-menu-modal-nav">
                  <button
                    onClick={() => {
                      setIsMoreMenuModalOpen(false)
                      handleTabChange('comments')
                    }}
                    className="more-menu-nav-item"
                  >
                    <span className="more-menu-nav-icon">💬</span>
                    <span className="more-menu-nav-label">내 댓글</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMoreMenuModalOpen(false)
                      handleTabChange('likes')
                    }}
                    className="more-menu-nav-item"
                  >
                    <span className="more-menu-nav-icon">👍</span>
                    <span className="more-menu-nav-label">받은 좋아요</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMoreMenuModalOpen(false)
                      handleTabChange('bookmarks')
                    }}
                    className="more-menu-nav-item"
                  >
                    <span className="more-menu-nav-icon">🔖</span>
                    <span className="more-menu-nav-label">북마크</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMoreMenuModalOpen(false)
                      handleTabChange('messages')
                    }}
                    className="more-menu-nav-item"
                  >
                    <span className="more-menu-nav-icon">📮</span>
                    <span className="more-menu-nav-label">우편함</span>
                    {unreadMessageCount > 0 && <span className="badge-count-mobile">{unreadMessageCount}</span>}
                  </button>
                  <button
                    onClick={() => {
                      setIsMoreMenuModalOpen(false)
                      handleTabChange('activity')
                    }}
                    className="more-menu-nav-item"
                  >
                    <span className="more-menu-nav-icon">📋</span>
                    <span className="more-menu-nav-label">활동 내역</span>
                  </button>
                </nav>
              </div>
            </div>
          </>
        )}
        {/* 쪽지 보내기 모달 */}
        {isMessageComposeModalOpen && (
          <>
            <div
              className="modal-overlay"
              onClick={() => {
                setIsMessageComposeModalOpen(false)
                setMessageForm({ receiverNickname: '', content: '' })
              }}
            ></div>
            <div className="message-modal">
              <div className="message-modal-header">
                <h2>✉️ 쪽지 보내기</h2>
                <button
                  className="message-modal-close"
                  onClick={() => {
                    setIsMessageComposeModalOpen(false)
                    setMessageForm({ receiverNickname: '', content: '' })
                  }}
                  aria-label="닫기"
                >
                  ✕
                </button>
              </div>
              <div className="message-modal-content">
                <form onSubmit={handleSendMessage}>
                  <div className="form-group">
                    <label htmlFor="receiverNickname">받는 사람 (닉네임)</label>
                    <input
                      type="text"
                      id="receiverNickname"
                      className="form-input"
                      placeholder="받는 사람의 닉네임을 입력하세요"
                      value={messageForm.receiverNickname}
                      onChange={(e) => setMessageForm({ ...messageForm, receiverNickname: e.target.value })}
                      disabled={sendingMessage}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="content">내용</label>
                    <textarea
                      id="content"
                      className="form-textarea"
                      placeholder="쪽지 내용을 입력하세요"
                      value={messageForm.content}
                      onChange={(e) => setMessageForm({ ...messageForm, content: e.target.value })}
                      disabled={sendingMessage}
                      rows="6"
                      required
                    />
                  </div>

                  <div className="message-modal-actions">
                    <button
                      type="button"
                      onClick={() => {
                        setIsMessageComposeModalOpen(false)
                        setMessageForm({ receiverNickname: '', content: '' })
                      }}
                      className="btn btn-outline"
                      disabled={sendingMessage}
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={sendingMessage}
                    >
                      {sendingMessage ? '보내는 중...' : '보내기'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </>
        )}

        {/* 쪽지 상세 모달 */}
        {isMessageModalOpen && selectedMessage && (
          <>
            <div
              className="modal-overlay"
              onClick={() => {
                setIsMessageModalOpen(false)
                setSelectedMessage(null)
              }}
            ></div>
            <div className="message-modal">
              <div className="message-modal-header">
                <h2>📬 쪽지 상세</h2>
                <button
                  className="message-modal-close"
                  onClick={() => {
                    setIsMessageModalOpen(false)
                    setSelectedMessage(null)
                  }}
                  aria-label="닫기"
                >
                  ✕
                </button>
              </div>
              <div className="message-modal-content">
                <div className="message-detail">
                  <div className="message-detail-header">
                    <div className="message-detail-user">
                      <span className="message-icon">👤</span>
                      <div>
                        <div className="message-detail-label">
                          {messageTab === 'received' ? '보낸 사람' : '받는 사람'}
                        </div>
                        <strong>
                          {messageTab === 'received'
                            ? selectedMessage.senderNickname || '알 수 없음'
                            : selectedMessage.receiverNickname || '알 수 없음'}
                        </strong>
                      </div>
                    </div>
                    <div className="message-detail-status">
                      {messageTab === 'sent' && (
                        <span className={`badge-read-status ${selectedMessage.isRead ? 'read' : 'unread-sent'}`}>
                          {selectedMessage.isRead ? '읽음' : '안 읽음'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="message-detail-time">
                    {formatRelativeTime(selectedMessage.createdAt)}
                  </div>

                  <div className="message-detail-content">
                    {selectedMessage.content}
                  </div>
                </div>

                <div className="message-modal-actions">
                  <button
                    onClick={() => {
                      setIsMessageModalOpen(false)
                      setSelectedMessage(null)
                    }}
                    className="btn btn-outline"
                  >
                    닫기
                  </button>
                  {messageTab === 'received' && (
                    <button
                      onClick={() => handleReply(selectedMessage)}
                      className="btn btn-primary"
                    >
                      ↩️ 답장하기
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default MyPage