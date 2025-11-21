/**
 * Header 컴포넌트 - 사이드바 네비게이션 방식
 *
 * 기능:
 * - 햄버거 메뉴를 통한 사이드바 오픈
 * - 고정 헤더 (position: fixed)
 * - 로고 표시
 * - 테마 전환 버튼
 * - 사용자 인증 상태에 따른 UI 변경
 * - 알림 아이콘 (인증된 사용자)
 * - 사용자 아바타 (인증된 사용자)
 *
 * 변경사항:
 * - 헤더 중앙의 검색바 제거됨 (홈페이지 본문으로 이동)
 * - 사이드바 메뉴로 네비게이션 개선
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import "./Header.css";
import debateLogoLight from "../../assets/debate-onlylogo.png";
import debateLogoDark from "../../assets/debate-logo-dark.png";

/**
 * Header 컴포넌트
 *
 * @returns {JSX.Element} 헤더 컴포넌트
 */
const Header = () => {
  // ===== Hooks 선언 =====
  const { user, logout, isAuthenticated } = useAuth(); // 인증 관련 상태 및 함수
  const { theme, toggleTheme } = useTheme(); // 테마 관련 상태 및 함수
  const navigate = useNavigate(); // 페이지 이동을 위한 navigate 함수
  const currentLogo = theme === "dark" ? debateLogoDark : debateLogoLight; // 추가!
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // 사이드바 열림/닫힘 상태

  /**
   * 로그아웃 처리 함수
   *
   * 동작:
   * 1. 로그아웃 실행 (AuthContext의 logout 함수 호출)
   * 2. 메인 페이지로 이동
   * 3. 사이드바 닫기
   */
  const handleLogout = () => {
    logout();
    navigate("/");
    setIsSidebarOpen(false);
  };

  /**
   * 사이드바 토글 함수
   *
   * 사이드바의 열림/닫힘 상태를 반전시킵니다.
   */
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  /**
   * 사이드바 닫기 함수
   *
   * 메뉴 항목 클릭 시 사이드바를 닫습니다.
   */
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* ===== 고정 헤더 ===== */}
      <header className="header-fixed">
        <div className="header-container">
          {/* 왼쪽 영역: 햄버거 메뉴 + 로고 */}
          <div className="header-left">
            {/* 햄버거 메뉴 버튼 */}
            <button
              className="hamburger-btn"
              onClick={toggleSidebar}
              aria-label="메뉴 열기"
              aria-expanded={isSidebarOpen}
            >
              {/* 햄버거 아이콘 (3줄) */}
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            {/* 로고 */}
            <Link to="/" className="header-logo">
              <img
                src={currentLogo}
                alt="DEBATE"
                className="logo-image"
                style={{ width: "50px", height: "100px" }}
              />
              <span className="logo-text">DEBATE</span>
            </Link>
          </div>

          {/* 중앙 영역: 비어있음 (검색바 제거됨) */}
          <div className="header-center">
            {/* 검색 기능은 홈페이지 본문으로 이동 */}
          </div>

          {/* 오른쪽 영역: 테마 전환 + 사용자 메뉴 */}
          <div className="header-right">
            {/* 테마 전환 버튼 (다크모드/라이트모드) */}
            <button
              className="icon-btn theme-btn"
              onClick={toggleTheme}
              aria-label="테마 전환"
            >
              {theme === "light" ? (
                // 라이트 모드일 때: 달 아이콘 표시
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                // 다크 모드일 때: 태양 아이콘 표시
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              )}
            </button>

            {/* 인증 상태에 따른 UI 분기 */}
            {isAuthenticated ? (
              // 로그인된 경우: 알림 + 사용자 아바타
              <>
                {/* 알림 버튼 */}
                <button className="icon-btn notification-btn" aria-label="알림">
                  {/* 종 아이콘 */}
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  {/* 읽지 않은 알림 배지 */}
                  <span className="notification-badge">3</span>
                </button>

                {/* 사용자 아바타 */}
                <Link to="/my" className="user-avatar">
                  {user?.profileImage ? (
                    // 프로필 이미지가 있으면 이미지 표시
                    <img src={user.profileImage} alt={user.nickname} />
                  ) : (
                    // 프로필 이미지가 없으면 닉네임 첫 글자 표시
                    <div className="avatar-placeholder">
                      {user?.nickname?.charAt(0) || "U"}
                    </div>
                  )}
                </Link>
              </>
            ) : (
              // 로그인되지 않은 경우: 로그인/회원가입 버튼
              <div className="auth-buttons">
                <Link to="/auth/login" className="btn btn-secondary btn-sm">
                  로그인
                </Link>
                <Link to="/auth/register" className="btn btn-primary btn-sm">
                  회원가입
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ===== 사이드바 오버레이 ===== */}
      {/* 사이드바가 열렸을 때 배경을 어둡게 하는 오버레이 */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}

      {/* ===== 사이드바 메뉴 ===== */}
      <aside className={`sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
        {/* 사이드바 헤더 */}
        <div className="sidebar-header">
          <h2 className="sidebar-title">메뉴</h2>
          {/* 닫기 버튼 */}
          <button
            className="sidebar-close"
            onClick={closeSidebar}
            aria-label="메뉴 닫기"
          >
            {/* X 아이콘 */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 사이드바 네비게이션 */}
        <nav className="sidebar-nav">
          {/* ===== 메인 메뉴 섹션 ===== */}
          <div className="nav-section">
            <h3 className="nav-section-title">메인</h3>

            {/* 홈 메뉴 */}
            <Link to="/" className="nav-item" onClick={closeSidebar}>
              <svg
                className="nav-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              <span>홈</span>
            </Link>

            {/* 토론 목록 메뉴 */}
            <Link to="/debate" className="nav-item" onClick={closeSidebar}>
              <svg
                className="nav-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>토론 목록</span>
            </Link>

            {/* 카테고리 메뉴 */}
            <Link to="/categories" className="nav-item" onClick={closeSidebar}>
              <svg
                className="nav-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
              <span>카테고리</span>
            </Link>

            {/* 검색 메뉴 */}
            <Link to="/search" className="nav-item" onClick={closeSidebar}>
              <svg
                className="nav-icon"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <span>검색</span>
            </Link>
          </div>

          {/* ===== 마이페이지 메뉴 섹션 (인증된 사용자만) ===== */}
          {isAuthenticated && (
            <div className="nav-section">
              <h3 className="nav-section-title">마이페이지</h3>

              {/* 토론 작성 버튼 (하이라이트) */}
              <Link
                to="/debate/create"
                className="nav-item nav-item-primary"
                onClick={closeSidebar}
              >
                <svg
                  className="nav-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span>토론 작성</span>
              </Link>

              {/* 내 정보 메뉴 */}
              <Link to="/my" className="nav-item" onClick={closeSidebar}>
                <svg
                  className="nav-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <span>내 정보</span>
              </Link>

              {/* 설정 메뉴 */}
              <Link
                to="/my/settings"
                className="nav-item"
                onClick={closeSidebar}
              >
                <svg
                  className="nav-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v6m0 6v6M5.636 5.636l4.243 4.243m4.242 4.242l4.243 4.243M1 12h6m6 0h6M5.636 18.364l4.243-4.243m4.242-4.242l4.243-4.243" />
                </svg>
                <span>설정</span>
              </Link>

              {/* 로그아웃 버튼 */}
              <button
                className="nav-item nav-item-danger"
                onClick={handleLogout}
              >
                <svg
                  className="nav-icon"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>로그아웃</span>
              </button>
            </div>
          )}
        </nav>

        {/* 사이드바 푸터 */}
        <div className="sidebar-footer">
          <p className="sidebar-footer-text">
            © 2025 DEBATE. All rights reserved.
          </p>
        </div>
      </aside>
    </>
  );
};

export default Header;
