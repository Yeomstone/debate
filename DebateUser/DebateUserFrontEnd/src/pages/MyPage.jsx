/**
 * MyPage 컴포넌트
 * 
 * 현재 로그인한 사용자의 마이페이지입니다.
 * 목업 기반으로 재작성되었습니다.
 * 
 * 주요 기능:
 * - 대시보드: 통계 요약, 인기 토론 TOP 3, 최근 활동
 * - 내 토론: 작성한 토론 목록
 * - 참여한 토론: 입장을 선택한 토론 목록
 * - 내 댓글: 작성한 댓글 목록
 * - 북마크: 북마크한 토론 목록 (준비 중)
 * - 활동 내역: 최근 활동 내역 (준비 중)
 * 
 * 참고: ProtectedRoute로 보호되어 있어 로그인한 사용자만 접근 가능합니다.
 */
import { useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/userService'
import { myPageService } from '../services/myPageService'
import { Link } from 'react-router-dom'
import './MyPage.css'

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

  // 초기 로딩
  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchMyDebates() // 대시보드용
    }
  }, [user])

  // URL 쿼리 파라미터로 탭 변경
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab) // 'debates', 'comments' 등

      // 해당 탭의 데이터도 로딩
      if (tab === 'my-debate') {
        fetchMyDebates()
      } else if (tab === 'participated') {
        fetchParticipatedDebates()
      } else if (tab === 'comments') {
        fetchMyComments()
      } else if (tab === 'likes') {
        fetchLikedDebates()
      }
    }
  }, [searchParams])


  /**
   * 프로필 정보 가져오기
   */
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

  /**
   * 내 토론 목록 가져오기
   */
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

  /**
   * 참여한 토론 목록 가져오기
   */
  const fetchParticipatedDebates = async () => {
    if (!user) return
    setLoadingData(true)
    try {
      const response = await myPageService.getMyOpinions()
      const data = response.data || response
      const opinions = Array.isArray(data) ? data : []

      // DebateOpinion에서 토론 정보 추출
      const debates = opinions.map(opinion => ({
        id: opinion.debate?.id,
        title: opinion.debate?.title,
        categoryName: opinion.debate?.category?.name,
        status: opinion.debate?.status,
        side: opinion.side,
        createdAt: opinion.createdAt
      })).filter(debate => debate.id) // 토론 정보가 있는 것만

      setParticipatedDebates(debates)
    } catch (error) {
      console.error('참여한 토론 목록 로딩 실패:', error)
      setParticipatedDebates([])
    } finally {
      setLoadingData(false)
    }
  }

  /**
   * 내 댓글 목록 가져오기
   */
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

  /**
   * 받은 좋아요 목록 가져오기
   */
  const fetchLikedDebates = async () => {
    if (!user) return
    setLoadingData(true)
    try {
      const response = await myPageService.getMyLikedDebates(0, 100)
      const pageData = response.data || response
      const content = pageData.content || []
      setLikedDebates(Array.isArray(content) ? content : [])
    } catch (error) {
      console.error('받은 좋아요 목록 로딩 실패:', error)
      setLikedDebates([])
    } finally {
      setLoadingData(false)
    }
  }

  /**
   * 탭 변경 핸들러
   */
  const handleTabChange = (tab) => {
    setActiveTab(tab)

    // 탭에 따라 데이터 로딩
    if (tab === 'my-debate') {
      fetchMyDebates()
    } else if (tab === 'participated') {
      fetchParticipatedDebates()
    } else if (tab === 'comments') {
      fetchMyComments()
    } else if (tab === 'likes') {
      fetchLikedDebates()
    }
  }

  /**
   * 시간 포맷팅 (상대 시간)
   */
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

  /**
   * 입장 표시 변환
   */
  const getSideLabel = (side) => {
    switch (side) {
      case 'FOR': return '찬성'
      case 'AGAINST': return '반대'
      case 'NEUTRAL': return '중립'
      case 'OTHER': return '기타'
      default: return side
    }
  }

  if (loading) {
    return <div className="container">로딩 중...</div>
  }

  return (
    <div className="my-page">
      <div className="container">
        {/* 모바일 프로필 헤더 */}
        {profile && (
          <div className="mobile-profile-header">
            <div className="mobile-profile-info">
              <div className="mobile-profile-avatar">
                {profile.profileImage ? (
                  <img src={profile.profileImage} alt={profile.nickname} />
                ) : (
                  '👤'
                )}
              </div>
              <div className="mobile-profile-details">
                <h2 className="mobile-profile-name">{profile.nickname || '이름 없음'}</h2>
                <div className="mobile-profile-stats">
                  <button
                    className="mobile-stat-item"
                    onClick={() => handleTabChange('my-debate')}
                  >
                    <span className="mobile-stat-value">{profile.debateCount ?? 0}</span>
                    <span className="mobile-stat-label">작성한 토론</span>
                  </button>
                  <button
                    className="mobile-stat-item"
                    onClick={() => handleTabChange('participated')}
                  >
                    <span className="mobile-stat-value">{profile.participatedCount ?? 0}</span>
                    <span className="mobile-stat-label">참여한 토론</span>
                  </button>
                  <button
                    className="mobile-stat-item"
                    onClick={() => handleTabChange('likes')}
                  >
                    <span className="mobile-stat-value">{profile.likeCount ?? 0}</span>
                    <span className="mobile-stat-label">받은 좋아요</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="mobile-profile-actions">
              <Link to="/my/edit" className="btn btn-outline btn-sm">
                프로필 수정
              </Link>
              <Link to="/my/settings" className="btn btn-outline btn-sm">
                계정 설정
              </Link>
            </div>
          </div>
        )}

        <div className="my-page-layout">
          {/* 사이드바 (데스크톱만 표시) */}
          <aside className="my-page-sidebar">
            {profile && (
              <>
                <div className="profile-card">
                  <div className="profile-avatar">
                    {profile.profileImage ? (
                      <img src={profile.profileImage} alt={profile.nickname} />
                    ) : (
                      '👤'
                    )}
                  </div>
                  <h2 className="profile-name">{profile.nickname || '이름 없음'}</h2>
                  {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                  <div className="profile-stats">
                    <button
                      className="stat-item stat-item-clickable"
                      onClick={() => handleTabChange('my-debate')}
                    >
                      <span className="stat-value">{profile.debateCount ?? 0}</span>
                      <span className="stat-label">작성한 토론</span>
                    </button>
                    <button
                      className="stat-item stat-item-clickable"
                      onClick={() => handleTabChange('participated')}
                    >
                      <span className="stat-value">{profile.participatedCount ?? 0}</span>
                      <span className="stat-label">참여한 토론</span>
                    </button>
                    <button
                      className="stat-item stat-item-clickable"
                      onClick={() => handleTabChange('likes')}
                    >
                      <span className="stat-value">{profile.likeCount ?? 0}</span>
                      <span className="stat-label">받은 좋아요</span>
                    </button>
                  </div>
                  <div className="profile-actions">
                    <Link
                      to="/my/edit"
                      className="btn btn-outline"
                      style={{ width: '100%' }}
                    >
                      프로필 수정
                    </Link>
                    <Link
                      to="/my/settings"
                      className="btn btn-outline"
                      style={{ width: '100%', marginTop: '0.5rem' }}
                    >
                      계정 설정
                    </Link>
                  </div>
                </div>

                <nav className="my-page-nav">
                  <button
                    onClick={() => handleTabChange('dashboard')}
                    className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
                  >
                    대시보드
                  </button>
                  <button
                    onClick={() => handleTabChange('my-debate')}
                    className={`nav-item ${activeTab === 'my-debate' ? 'active' : ''}`}
                  >
                    내 토론
                  </button>
                  <button
                    onClick={() => handleTabChange('participated')}
                    className={`nav-item ${activeTab === 'participated' ? 'active' : ''}`}
                  >
                    참여한 토론
                  </button>
                  <button
                    onClick={() => handleTabChange('comments')}
                    className={`nav-item ${activeTab === 'comments' ? 'active' : ''}`}
                  >
                    내 댓글
                  </button>
                  <button
                    onClick={() => handleTabChange('likes')}
                    className={`nav-item ${activeTab === 'likes' ? 'active' : ''}`}
                  >
                    받은 좋아요
                  </button>
                  <button
                    onClick={() => handleTabChange('bookmarks')}
                    className={`nav-item ${activeTab === 'bookmarks' ? 'active' : ''}`}
                  >
                    북마크
                  </button>
                  <button
                    onClick={() => handleTabChange('activity')}
                    className={`nav-item ${activeTab === 'activity' ? 'active' : ''}`}
                  >
                    활동 내역
                  </button>
                </nav>
              </>
            )}
          </aside>

          {/* 메인 컨텐츠 */}
          <div className="my-page-content">
            {/* 대시보드 탭 */}
            {activeTab === 'dashboard' && (
              <>
                <div className="page-header">
                  <h1>대시보드</h1>
                </div>

                {/* 통계 요약 */}
                {profile && (
                  <div className="stats-grid">
                    <button
                      className="stat-card stat-card-clickable"
                      onClick={() => handleTabChange('my-debate')}
                    >
                      <div className="stat-icon">📝</div>
                      <div className="stat-info">
                        <div className="stat-number">{profile.debateCount ?? 0}</div>
                        <div className="stat-label">작성한 토론</div>
                      </div>
                    </button>
                    <button
                      className="stat-card stat-card-clickable"
                      onClick={() => handleTabChange('comments')}
                    >
                      <div className="stat-icon">💬</div>
                      <div className="stat-info">
                        <div className="stat-number">{profile.commentCount ?? 0}</div>
                        <div className="stat-label">작성한 댓글</div>
                      </div>
                    </button>
                    <button
                      className="stat-card stat-card-clickable"
                      onClick={() => handleTabChange('participated')}
                    >
                      <div className="stat-icon">🏆</div>
                      <div className="stat-info">
                        <div className="stat-number">{profile.participatedCount ?? 0}</div>
                        <div className="stat-label">참여한 토론</div>
                      </div>
                    </button>
                    <button
                      className="stat-card stat-card-clickable"
                      onClick={() => handleTabChange('likes')}
                    >
                      <div className="stat-icon">👍</div>
                      <div className="stat-info">
                        <div className="stat-number">{profile.likeCount ?? 0}</div>
                        <div className="stat-label">받은 좋아요</div>
                      </div>
                    </button>
                  </div>
                )}

                {/* 인기 토론 TOP 3 */}
                <section className="section">
                  <h2>내 인기 토론 TOP 3</h2>
                  <div className="my-debate-list">
                    {loadingData ? (
                      <p>로딩 중...</p>
                    ) : myDebates.length > 0 ? (
                      myDebates
                        .sort((a, b) => (b.likeCount || 0) - (a.likeCount || 0))
                        .slice(0, 3)
                        .map((debate) => (
                          <Link key={debate.id} to={`/debate/${debate.id}`} className="my-debate-item-link">
                            <div className="my-debate-item">
                              <div className="debate-item-header">
                                <span className="category-badge">{debate.categoryName}</span>
                                <span className={`status-badge status-${debate.status?.toLowerCase()}`}>
                                  {debate.status === 'ACTIVE' ? '진행중' : debate.status === 'ENDED' ? '종료' : '예정'}
                                </span>
                              </div>
                              <h3>
                                {debate.title}
                              </h3>
                              <div className="debate-item-meta">
                                <span className="stat">
                                  👍 {debate.likeCount || 0} | 💬 {debate.commentCount || 0} | 👁️ {debate.viewCount || 0}
                                </span>
                                <span className="date">
                                  {new Date(debate.createdAt).toLocaleDateString('ko-KR')}
                                </span>
                              </div>
                            </div>
                          </Link>
                        ))
                    ) : (
                      <p style={{ color: 'var(--text-secondary)' }}>아직 작성한 토론이 없습니다.</p>
                    )}
                  </div>
                </section>

                {/* 최근 활동 */}
                <section className="section">
                  <h2>최근 활동</h2>
                  <div className="activity-list">
                    {myComments.length > 0 ? (
                      myComments.slice(0, 5).map((comment) => (
                        <Link key={comment.id} to={`/debate/${comment.debateId}`} className="activity-item-link">
                          <div className="activity-item">
                            <div className="activity-icon">💬</div>
                            <div className="activity-content">
                              <p>
                                <strong>{profile.nickname}</strong>님이 토론에 댓글을 작성했습니다.
                              </p>
                              <span className="activity-time">{formatRelativeTime(comment.createdAt)}</span>
                            </div>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p style={{ color: 'var(--text-secondary)' }}>최근 활동이 없습니다.</p>
                    )}
                  </div>
                </section>
              </>
            )}

            {/* 내 토론 탭 */}
            {activeTab === 'my-debate' && (
              <>
                <div className="page-header">
                  <h1>내 토론</h1>
                </div>
                {loadingData ? (
                  <p>로딩 중...</p>
                ) : myDebates.length > 0 ? (
                  <div className="my-debate-list">
                    {myDebates.map((debate) => (
                      <Link key={debate.id} to={`/debate/${debate.id}`} className="my-debate-item-link">
                        <div className="my-debate-item">
                          <div className="debate-item-header">
                            <span className="category-badge">{debate.categoryName}</span>
                            <span className={`status-badge status-${debate.status?.toLowerCase()}`}>
                              {debate.status === 'ACTIVE' ? '진행중' : debate.status === 'ENDED' ? '종료' : '예정'}
                            </span>
                          </div>
                          <h3>
                            {debate.title}
                          </h3>
                          <div className="debate-item-meta">
                            <span className="stat">
                              👍 {debate.likeCount || 0} | 💬 {debate.commentCount || 0} | 👁️ {debate.viewCount || 0}
                            </span>
                            <span className="date">
                              {new Date(debate.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>작성한 토론이 없습니다.</p>
                )}
              </>
            )}

            {/* 참여한 토론 탭 */}
            {activeTab === 'participated' && (
              <>
                <div className="page-header">
                  <h1>참여한 토론</h1>
                </div>
                {loadingData ? (
                  <p>로딩 중...</p>
                ) : participatedDebates.length > 0 ? (
                  <div className="my-debate-list">
                    {participatedDebates.map((debate, index) => (
                      <Link key={debate.id || index} to={`/debate/${debate.id}`} className="my-debate-item-link">
                        <div className="my-debate-item">
                          <div className="debate-item-header">
                            <span className="category-badge">{debate.categoryName || '카테고리'}</span>
                            <span className={`status-badge status-${debate.status?.toLowerCase() || 'active'}`}>
                              {debate.status === 'ACTIVE' ? '진행중' : debate.status === 'ENDED' ? '종료' : '예정'}
                            </span>
                            {debate.side && (
                              <span className={`side-badge side-${debate.side.toLowerCase()}`}>
                                {getSideLabel(debate.side)}
                              </span>
                            )}
                          </div>
                          <h3>
                            {debate.title}
                          </h3>
                          <div className="debate-item-meta">
                            <span className="date">
                              {debate.createdAt ? new Date(debate.createdAt).toLocaleDateString('ko-KR') : ''}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>참여한 토론이 없습니다.</p>
                )}
              </>
            )}

            {/* 내 댓글 탭 */}
            {activeTab === 'comments' && (
              <>
                <div className="page-header">
                  <h1>내 댓글</h1>
                </div>
                {loadingData ? (
                  <p>로딩 중...</p>
                ) : myComments.length > 0 ? (
                  <div className="activity-list">
                    {myComments.map((comment) => (
                      <Link key={comment.id} to={`/debate/${comment.debateId}`} className="activity-item-link">
                        <div className="activity-item">
                          <div className="activity-icon">💬</div>
                          <div className="activity-content">
                            <p>
                              {comment.content}
                            </p>
                            <span className="activity-time">
                              {new Date(comment.createdAt).toLocaleString('ko-KR')}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>작성한 댓글이 없습니다.</p>
                )}
              </>
            )}

            {/* 받은 좋아요 탭 */}
            {activeTab === 'likes' && (
              <>
                <div className="page-header">
                  <h1>받은 좋아요</h1>
                </div>
                {loadingData ? (
                  <p>로딩 중...</p>
                ) : likedDebates.length > 0 ? (
                  <div className="my-debate-list">
                    {likedDebates.map((debate) => (
                      <Link key={debate.id} to={`/debate/${debate.id}`} className="my-debate-item-link">
                        <div className="my-debate-item">
                          <div className="debate-item-header">
                            <span className="category-badge">{debate.categoryName}</span>
                            <span className={`status-badge status-${debate.status?.toLowerCase()}`}>
                              {debate.status === 'ACTIVE' ? '진행중' : debate.status === 'ENDED' ? '종료' : '예정'}
                            </span>
                          </div>
                          <h3>
                            {debate.title}
                          </h3>
                          <div className="debate-item-meta">
                            <span className="stat">
                              👍 {debate.likeCount || 0} | 💬 {debate.commentCount || 0} | 👁️ {debate.viewCount || 0}
                            </span>
                            <span className="date">
                              {new Date(debate.createdAt).toLocaleDateString('ko-KR')}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-secondary)' }}>받은 좋아요가 없습니다.</p>
                )}
              </>
            )}

            {/* 북마크 탭 */}
            {activeTab === 'bookmarks' && (
              <>
                <div className="page-header">
                  <h1>북마크</h1>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>북마크 기능은 준비 중입니다.</p>
              </>
            )}

            {/* 활동 내역 탭 */}
            {activeTab === 'activity' && (
              <>
                <div className="page-header">
                  <h1>활동 내역</h1>
                </div>
                <p style={{ color: 'var(--text-secondary)' }}>활동 내역 기능은 준비 중입니다.</p>
              </>
            )}
          </div>
        </div>

        {/* 모바일 하단 탭 네비게이션 */}
        <nav className="mobile-bottom-nav">
          <button
            onClick={() => {
              setIsMoreMenuModalOpen(false) // 더보기 모달 닫기
              setIsProfileModalOpen(true)
            }}
            className="mobile-nav-item mobile-nav-item-profile"
          >
            <span className="mobile-nav-icon">👤</span>
            <span className="mobile-nav-label">프로필</span>
          </button>
          <button
            onClick={() => {
              setIsProfileModalOpen(false) // 프로필 모달 닫기
              setIsMoreMenuModalOpen(false) // 더보기 모달 닫기
              handleTabChange('dashboard')
            }}
            className={`mobile-nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">📊</span>
            <span className="mobile-nav-label">대시보드</span>
          </button>
          <button
            onClick={() => {
              setIsProfileModalOpen(false) // 프로필 모달 닫기
              setIsMoreMenuModalOpen(false) // 더보기 모달 닫기
              handleTabChange('my-debate')
            }}
            className={`mobile-nav-item ${activeTab === 'my-debate' ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">📝</span>
            <span className="mobile-nav-label">내 토론</span>
          </button>
          <button
            onClick={() => {
              setIsProfileModalOpen(false) // 프로필 모달 닫기
              setIsMoreMenuModalOpen(false) // 더보기 모달 닫기
              handleTabChange('participated')
            }}
            className={`mobile-nav-item ${activeTab === 'participated' ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">🏆</span>
            <span className="mobile-nav-label">참여한 토론</span>
          </button>
          <button
            onClick={() => {
              setIsProfileModalOpen(false) // 프로필 모달 닫기
              setIsMoreMenuModalOpen(false) // 더보기 모달 닫기
              handleTabChange('comments')
            }}
            className={`mobile-nav-item ${activeTab === 'comments' ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">💬</span>
            <span className="mobile-nav-label">내 댓글</span>
          </button>
          <button
            onClick={() => {
              setIsProfileModalOpen(false) // 프로필 모달 닫기
              setIsMoreMenuModalOpen(false) // 더보기 모달 닫기
              handleTabChange('likes')
            }}
            className={`mobile-nav-item ${activeTab === 'likes' ? 'active' : ''}`}
          >
            <span className="mobile-nav-icon">👍</span>
            <span className="mobile-nav-label">받은 좋아요</span>
          </button>
          <button
            onClick={() => {
              setIsProfileModalOpen(false) // 프로필 모달 닫기
              setIsMoreMenuModalOpen(true)
            }}
            className="mobile-nav-item mobile-nav-item-more"
          >
            <span className="mobile-nav-icon">⋯</span>
            <span className="mobile-nav-label">더보기</span>
          </button>
        </nav>

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
      </div>
    </div>
  )
}

export default MyPage

