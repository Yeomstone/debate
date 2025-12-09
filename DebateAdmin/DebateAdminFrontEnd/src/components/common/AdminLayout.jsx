/**
 * 관리자 레이아웃 컴포넌트
 * 
 * 관리자 페이지의 공통 레이아웃을 제공합니다.
 * 사이드바와 헤더를 포함합니다.
 */

import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import debateLogoLight from '../../assets/debate-onlylogo.png'
import debateLogoDark from '../../assets/debate-logo-dark.png'
import './AdminLayout.css'

const AdminLayout = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const { admin, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const currentLogo = theme === 'dark' ? debateLogoDark : debateLogoLight

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isActive = (path) => {
    return location.pathname === path
  }

  const menuItems = [
    { path: '/', label: '대시보드', icon: '📊' },
    { path: '/users', label: '회원 관리', icon: '👥' },
    { path: '/debate', label: '토론 관리', icon: '💬' },
    { path: '/comments', label: '댓글 관리', icon: '💭' },
    { path: '/categories', label: '카테고리 관리', icon: '📂' },
    { path: '/reports', label: '신고 관리', icon: '🚨' },
    { path: '/statistics', label: '통계 및 분석', icon: '📈' },
    { path: '/settings', label: '시스템 설정', icon: '⚙️' },
    { path: '/admins', label: '관리자 관리', icon: '👤' }
  ]

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  return (
    <div className="admin-layout">
      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={toggleSidebar}
          aria-hidden="true"
        />
      )}
      {/* 사이드바 */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-logo">
          <Link to="/" className="logo-link">
            <img 
              src={currentLogo}
              alt="Debate Logo" 
              className="logo-image"
            />
            <span className="logo-text">DEBATE</span>
          </Link>
          {/* 사이드바가 열려있을 때만 사이드바 안에 토글 버튼 표시 */}
          {sidebarOpen && (
            <button
              className="hamburger-btn"
              onClick={toggleSidebar}
              aria-label="메뉴 닫기"
            >
              <span className="hamburger-icon">✕</span>
            </button>
          )}
        </div>
        <nav className="admin-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* 메인 컨텐츠 */}
      <main className={`admin-main ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <header className="admin-header">
          <div className="header-left">
            {/* 사이드바가 닫혀있을 때만 헤더에 토글 버튼 표시 */}
            {!sidebarOpen && (
              <button
                className="hamburger-btn"
                onClick={toggleSidebar}
                aria-label="메뉴 열기"
              >
                <span className="hamburger-icon">☰</span>
              </button>
            )}
            {/* 사이드바가 닫혀있을 때만 헤더에 로고와 텍스트 표시 */}
            {!sidebarOpen && (
              <Link to="/" className="header-logo-link">
                <img 
                  src={currentLogo}
                  alt="Debate Logo" 
                  className="header-logo-image"
                />
                <span className="header-logo-text">DEBATE</span>
              </Link>
            )}
          </div>
          <div className="admin-header-actions">
          <button
              onClick={toggleTheme}
              className="theme-toggle"
              aria-label="테마 전환"
            >
              {theme === 'light' ? '🌙' : '☀️'}
          </button>
            <div className="header-admin-info">
              <div className="admin-avatar">👤</div>
              <div className="admin-info">
                <div className="admin-name">{admin?.name || '관리자'}</div>
                <div className="admin-role">
                  {admin?.role === 'SUPER_ADMIN' ? '슈퍼 관리자' : '일반 관리자'}
                </div>
              </div>
            </div>
            
            <button onClick={handleLogout} className="header-logout-btn">
              로그아웃
            </button>
            <span className="current-time">
              {new Date().toLocaleString('ko-KR')}
            </span>
          </div>
        </header>
        <div className="admin-content">{children}</div>
      </main>
    </div>
  )
}

export default AdminLayout

