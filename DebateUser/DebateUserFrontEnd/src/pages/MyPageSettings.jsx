/**
 * MyPageSettings 컴포넌트
 *
 * 마이페이지 계정 설정 페이지입니다.
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { userService } from '../services/userService'
import './MyPageSettings.css'

const MyPageSettings = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  // 상태 관리
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({})

  /**
   * 컴포넌트 마운트 시 프로필 정보 로딩
   */
  useEffect(() => {
    if (user) {
      fetchProfile()
    }
  }, [user])

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
   * 비밀번호 변경 입력 핸들러
   */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))

    // 에러 초기화
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  /**
   * 비밀번호 변경 유효성 검사
   */
  const validatePassword = () => {
    const newErrors = {}

    // 비밀번호 정규식: 대문자, 소문자, 숫자, 특수문자 각 1개 이상, 8자 이상
    const passwordPattern =
      /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}|:;'"<>,.?/]).{8,}$/

    if (!passwordData.newPassword) {
      newErrors.newPassword = '새 비밀번호를 입력하세요.'
    } else if (!passwordPattern.test(passwordData.newPassword)) {
      newErrors.newPassword =
        '대문자, 소문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.'
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다.'
    }

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = '현재 비밀번호를 입력하세요.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  /**
   * 비밀번호 변경 제출
   */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault()

    if (!validatePassword()) {
      return
    }

    // TODO: 비밀번호 변경 API 호출
    alert('비밀번호 변경 기능은 준비 중입니다.')
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  if (loading) {
    return <div className="container">로딩 중...</div>
  }

  return (
    <div className="my-page-settings">
      <div className="container">
        <div className="my-page-layout">
          {/* 사이드바 */}
          <aside className="my-page-sidebar">
            <div className="profile-card">
              <div className="profile-avatar">
                {profile?.profileImage ? (
                  <img src={profile.profileImage} alt="프로필" />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <h2 className="profile-name">
                {profile?.nickname || '이름 없음'}
              </h2>
              <p className="profile-bio">
                {profile?.bio || '자기소개를 입력하세요'}
              </p>
              <div className="profile-actions">
                <button
                  onClick={() => navigate('/my')}
                  className="btn btn-outline"
                  style={{ width: '100%' }}
                >
                  마이페이지로
                </button>
              </div>
            </div>
          </aside>

          {/* 메인 컨텐츠 */}
          <div className="my-page-content">
            <div className="page-header">
              <h1>계정 설정</h1>
              <p className="page-description">
                계정 정보 및 보안 설정을 관리할 수 있습니다.
              </p>
            </div>

            <div className="settings-form">
              {/* 이메일 설정 */}
              <div className="form-section modern-section section-with-title">
                <div className="section-title">이메일 설정</div>
                <div className="form-group">
                  <label
                    htmlFor="current-email"
                    className="form-label"
                  >
                    이메일
                  </label>
                  <input
                    type="email"
                    id="current-email"
                    className="form-input"
                    value={profile?.email || ''}
                    readOnly
                    disabled
                  />
                  <p className="form-help">
                    이메일 변경 기능은 준비 중입니다.
                  </p>
                </div>
              </div>

              {/* 비밀번호 변경 */}
              <div className="form-section password-change-section section-with-title">
                <div className="section-title">비밀번호 변경</div>
                <form onSubmit={handlePasswordSubmit}>
                  <div className="form-group">
                    <label
                      htmlFor="new-password"
                      className="form-label"
                    >
                      새 비밀번호
                      <span className="password-hint">
                        영문, 숫자, 특수문자 조합 8자 이상
                      </span>
                    </label>
                    <input
                      type="password"
                      id="new-password"
                      name="newPassword"
                      className={`form-input ${errors.newPassword ? 'error' : ''
                        }`}
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      placeholder="새 비밀번호"
                    />
                    {errors.newPassword && (
                      <p className="form-error">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label
                      htmlFor="confirm-password"
                      className="form-label"
                    >
                      새 비밀번호 확인
                    </label>
                    <input
                      type="password"
                      id="confirm-password"
                      name="confirmPassword"
                      className={`form-input ${errors.confirmPassword ? 'error' : ''
                        }`}
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      placeholder="새 비밀번호 확인"
                    />
                    {errors.confirmPassword && (
                      <p className="form-error">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>

                  <div className="form-group">
                    <label
                      htmlFor="current-password"
                      className="form-label"
                    >
                      현재 비밀번호
                    </label>
                    <input
                      type="password"
                      id="current-password"
                      name="currentPassword"
                      className={`form-input ${errors.currentPassword ? 'error' : ''
                        }`}
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      placeholder="현재 비밀번호"
                    />
                    {errors.currentPassword && (
                      <p className="form-error">
                        {errors.currentPassword}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="btn btn-password-change"
                  >
                    비밀번호 변경
                  </button>
                </form>
              </div>

              {/* 알림 설정 */}
              <div className="form-section modern-section section-with-title">
                <div className="section-title">알림 설정</div>
                <p className="form-help">
                  알림 설정 기능은 준비 중입니다.
                </p>
              </div>

              {/* 개인정보 보호 */}
              <div className="form-section modern-section section-with-title">
                <div className="section-title">개인정보 보호</div>
                <p className="form-help">
                  개인정보 보호 설정 기능은 준비 중입니다.
                </p>
              </div>

              {/* 계정 삭제 */}
              <div className="form-section danger-section section-with-title">
                <div className="section-title section-title-danger">
                  계정 삭제
                </div>
                <p className="form-help">
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제되며
                  복구할 수 없습니다.
                </p>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => {
                    if (
                      window.confirm(
                        '정말 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.'
                      )
                    ) {
                      alert('계정 삭제 기능은 준비 중입니다.')
                    }
                  }}
                >
                  계정 삭제
                </button>
              </div>

              {/* 하단 버튼 */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate('/my')}
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MyPageSettings
