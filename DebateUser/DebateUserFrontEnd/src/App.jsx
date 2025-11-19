/**
 * Debate User Frontend - 메인 애플리케이션 컴포넌트
 * 
 * 이 파일은 애플리케이션의 진입점으로, 라우팅과 전역 컨텍스트를 설정합니다.
 * 
 * 주요 기능:
 * - React Router를 통한 페이지 라우팅 설정
 * - 인증 컨텍스트 제공 (AuthProvider)
 * - 테마 컨텍스트 제공 (ThemeProvider)
 * - 공통 레이아웃 적용 (Layout)
 * - 보호된 라우트 설정 (ProtectedRoute)
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/common/Layout'
import HomePage from './pages/HomePage'
import DebateListPage from './pages/DebateListPage'
import DebateDetailPage from './pages/DebateDetailPage'
import DebateCreatePage from './pages/DebateCreatePage'
import DebateEditPage from './pages/DebateEditPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import MyPage from './pages/MyPage'
import MyPageEdit from './pages/MyPageEdit'
import MyPageSettings from './pages/MyPageSettings'
import UserProfilePage from './pages/UserProfilePage'
import CategoryListPage from './pages/CategoryListPage'
import CategoryDetailPage from './pages/CategoryDetailPage'
import SearchPage from './pages/SearchPage'
import ProtectedRoute from './components/common/ProtectedRoute'

/**
 * App 컴포넌트
 * 
 * 애플리케이션의 최상위 컴포넌트로, 모든 페이지와 컨텍스트를 포함합니다.
 * 
 * @returns {JSX.Element} 애플리케이션 루트 컴포넌트
 */
function App() {
  return (
    // 테마 컨텍스트: 다크모드/라이트모드 전환 기능 제공
    <ThemeProvider>
      {/* 인증 컨텍스트: 사용자 로그인 상태 및 인증 관련 기능 제공 */}
      <AuthProvider>
        {/* React Router: 클라이언트 사이드 라우팅 설정 */}
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          {/* 공통 레이아웃: Header, Footer 포함 */}
          <Layout>
            {/* 라우트 정의 */}
            <Routes>
              {/* 공개 라우트 */}
              <Route path="/" element={<HomePage />} /> {/* 메인 페이지 */}
              <Route path="/debate" element={<DebateListPage />} /> {/* 토론 목록 페이지 */}
              <Route path="/debate/:id" element={<DebateDetailPage />} /> {/* 토론 상세 페이지 */}
              <Route path="/auth/login" element={<LoginPage />} /> {/* 로그인 페이지 */}
              <Route path="/auth/register" element={<RegisterPage />} /> {/* 회원가입 페이지 */}
              <Route path="/users/:userId" element={<UserProfilePage />} /> {/* 사용자 프로필 페이지 */}
              <Route path="/categories" element={<CategoryListPage />} /> {/* 카테고리 목록 페이지 */}
              <Route path="/categories/:id" element={<CategoryDetailPage />} /> {/* 카테고리별 토론 페이지 */}
              <Route path="/search" element={<SearchPage />} /> {/* 검색 페이지 */}
              
              {/* 보호된 라우트: 로그인 필요 */}
              <Route path="/debate/create" element={<ProtectedRoute><DebateCreatePage /></ProtectedRoute>} /> {/* 토론 작성 페이지 */}
              <Route path="/debate/:id/edit" element={<ProtectedRoute><DebateEditPage /></ProtectedRoute>} /> {/* 토론 수정 페이지 */}
              <Route path="/my" element={<ProtectedRoute><MyPage /></ProtectedRoute>} /> {/* 마이페이지 */}
              <Route path="/my/edit" element={<ProtectedRoute><MyPageEdit /></ProtectedRoute>} /> {/* 프로필 수정 페이지 */}
              <Route path="/my/settings" element={<ProtectedRoute><MyPageSettings /></ProtectedRoute>} /> {/* 계정 설정 페이지 */}
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App

