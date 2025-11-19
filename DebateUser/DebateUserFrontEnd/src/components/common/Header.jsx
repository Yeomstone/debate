/**
 * Header 컴포넌트
 * 
 * 애플리케이션의 상단 네비게이션 헤더입니다.
 * 
 * 주요 기능:
 * - 로고 및 메인 네비게이션
 * - 테마 전환 버튼
 * - 인증 상태에 따른 버튼 표시 (로그인/회원가입 또는 토론 작성/마이페이지/로그아웃)
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import './Header.css'

/**
 * Header 컴포넌트
 * 
 * @returns {JSX.Element} 헤더 컴포넌트
 */
const Header = () => {
  // 인증 관련 훅
  const { user, logout, isAuthenticated } = useAuth()
  // 테마 관련 훅
  const { theme, toggleTheme } = useTheme()
  // 네비게이션 훅
  const navigate = useNavigate()
  // 모바일 메뉴 열림/닫힘 상태
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  /**
   * 로그아웃 처리 함수
   * 
   * 로그아웃 후 메인 페이지로 이동합니다.
   */
  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMobileMenuOpen(false) // 모바일 메뉴 닫기
  }

  /**
   * 모바일 메뉴 토글 함수
   */
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  /**
   * 모바일 메뉴 닫기 함수
   */
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          {/* 로고 영역 */}
          <div className="logo">
            <Link to="/" onClick={closeMobileMenu}>
              <img src="/images/DEBATE.png" alt="Debate" className="logo-img" />
            </Link>
          </div>
          
          {/* 데스크톱 메인 네비게이션 */}
          <nav className="nav desktop-nav">
            <Link to="/" className="nav-link">
              홈
            </Link>
            <Link to="/debate" className="nav-link">
              토론 목록
            </Link>
          </nav>
          
          {/* 데스크톱 헤더 액션 버튼들 */}
          <div className="header-actions desktop-actions">
            {/* 테마 전환 버튼 */}
            <button
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label="테마 전환"
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            
            {/* 인증 상태에 따른 버튼 표시 */}
            {isAuthenticated ? (
              // 로그인된 사용자: 토론 작성, 마이페이지, 로그아웃 버튼
              <>
                <Link to="/debate/create" className="btn btn-primary">
                  토론 작성
                </Link>
                <Link to="/my" className="btn btn-outline">
                  마이페이지
                </Link>
                <button onClick={handleLogout} className="btn btn-outline">
                  로그아웃
                </button>
              </>
            ) : (
              // 비로그인 사용자: 로그인, 회원가입 버튼
              <>
                <Link to="/auth/login" className="btn btn-outline">
                  로그인
                </Link>
                <Link to="/auth/register" className="btn btn-primary">
                  회원가입
                </Link>
              </>
            )}
          </div>

          {/* 모바일 햄버거 버튼 */}
          <button
            className="hamburger-btn"
            onClick={toggleMobileMenu}
            aria-label="메뉴 열기/닫기"
            aria-expanded={isMobileMenuOpen}
          >
            <span className={`hamburger-icon ${isMobileMenuOpen ? 'open' : ''}`}>
              <span></span>
              <span></span>
              <span></span>
            </span>
          </button>
        </div>
      </div>

      {/* 모바일 메뉴 오버레이 */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenu}></div>
      )}

      {/* 모바일 메뉴 */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        {/* 모바일 네비게이션 */}
        <nav className="mobile-nav">
          <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
            홈
          </Link>
          <Link to="/debate" className="mobile-nav-link" onClick={closeMobileMenu}>
            토론 목록
          </Link>
        </nav>

        {/* 모바일 액션 버튼들 */}
        <div className="mobile-actions">
          {/* 테마 전환 버튼 */}
          <button
            className="mobile-theme-toggle"
            onClick={toggleTheme}
            aria-label="테마 전환"
          >
            <span>{theme === 'light' ? '🌙' : '☀️'}</span>
            <span>테마 전환</span>
          </button>
          
          {/* 인증 상태에 따른 버튼 표시 */}
          {isAuthenticated ? (
            // 로그인된 사용자: 토론 작성, 마이페이지, 로그아웃 버튼
            <>
              <Link to="/debate/create" className="btn btn-primary mobile-btn" onClick={closeMobileMenu}>
                토론 작성
              </Link>
              <Link to="/my" className="btn btn-outline mobile-btn" onClick={closeMobileMenu}>
                마이페이지
              </Link>
              <button onClick={handleLogout} className="btn btn-outline mobile-btn">
                로그아웃
              </button>
            </>
          ) : (
            // 비로그인 사용자: 로그인, 회원가입 버튼
            <>
              <Link to="/auth/login" className="btn btn-outline mobile-btn" onClick={closeMobileMenu}>
                로그인
              </Link>
              <Link to="/auth/register" className="btn btn-primary mobile-btn" onClick={closeMobileMenu}>
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

