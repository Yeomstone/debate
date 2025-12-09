/**
 * 관리자 인증 컨텍스트 (Admin Authentication Context)
 * 
 * 관리자 인증 상태를 전역적으로 관리하는 Context API입니다.
 * 
 * 주요 기능:
 * - 관리자 로그인/로그아웃 상태 관리
 * - JWT 토큰 관리
 * - 현재 로그인한 관리자 정보 관리
 */

import { createContext, useContext, useState, useEffect } from 'react'
import { adminAuthService } from '../services/adminAuthService'

// AuthContext 생성
const AuthContext = createContext(null)

/**
 * useAuth 훅
 * 
 * AuthContext를 사용하기 위한 커스텀 훅입니다.
 * AuthProvider 외부에서 사용하면 에러를 발생시킵니다.
 * 
 * @returns {Object} 인증 관련 상태 및 함수들
 * @throws {Error} AuthProvider 외부에서 사용 시 에러 발생
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

/**
 * AuthProvider 컴포넌트
 * 
 * 인증 관련 상태와 함수를 제공하는 Provider 컴포넌트입니다.
 * 
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 자식 컴포넌트
 * @returns {JSX.Element} AuthContext.Provider
 */
export const AuthProvider = ({ children }) => {
  // 상태 관리
  // localStorage에서 관리자 정보 복원
  const getStoredAdmin = () => {
    try {
      const stored = localStorage.getItem('adminInfo')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }

  const [admin, setAdmin] = useState(getStoredAdmin()) // 현재 로그인한 관리자 정보
  const [token, setToken] = useState(localStorage.getItem('adminToken')) // JWT 토큰
  const [loading, setLoading] = useState(true) // 로딩 상태

  /**
   * JWT 토큰 만료 시간 확인
   * @param {string} token JWT 토큰
   * @returns {boolean} 토큰이 유효하면 true, 만료되었으면 false
   */
  const isTokenValid = (token) => {
    if (!token) return false
    
    try {
      // JWT 토큰은 Base64로 인코딩된 3부분으로 구성: header.payload.signature
      const parts = token.split('.')
      if (parts.length !== 3) return false
      
      // payload 부분 디코딩
      const payload = JSON.parse(atob(parts[1]))
      
      // 만료 시간 확인 (exp는 초 단위 Unix timestamp)
      if (payload.exp) {
        const expirationTime = payload.exp * 1000 // 밀리초로 변환
        const currentTime = Date.now()
        
        // 만료 시간이 현재 시간보다 작으면 만료됨
        if (expirationTime < currentTime) {
          return false
        }
      }
      
      return true
    } catch (error) {
      // 토큰 파싱 실패 시 유효하지 않음
      return false
    }
  }

  /**
   * 컴포넌트 마운트 시 토큰이 있으면 관리자 정보 복원
   * 토큰 유효성 검증 포함
   */
  useEffect(() => {
    if (token) {
      // 토큰 유효성 검증
      if (isTokenValid(token)) {
        // 토큰이 유효하면 저장된 관리자 정보 복원
        const storedAdmin = getStoredAdmin()
        if (storedAdmin) {
          setAdmin(storedAdmin)
        }
      } else {
        // 토큰이 만료되었거나 유효하지 않으면 제거
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminInfo')
        setToken(null)
        setAdmin(null)
      }
      setLoading(false)
    } else {
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminInfo')
      setLoading(false)
    }
  }, [])

  /**
   * 로그인 함수
   * 
   * @param {string} adminId - 관리자 아이디
   * @param {string} password - 비밀번호
   * @returns {Promise<Object>} 인증 응답 데이터
   */
  const login = async (adminId, password) => {
    const response = await adminAuthService.login(adminId, password)
    const authData = response.data || response
    const adminInfo = authData.admin || authData.data?.admin
    
    setToken(authData.token || authData.data?.token)
    setAdmin(adminInfo)
    
    // localStorage에 관리자 정보 저장
    if (adminInfo) {
      localStorage.setItem('adminInfo', JSON.stringify(adminInfo))
    }
    if (authData.token || authData.data?.token) {
      localStorage.setItem('adminToken', authData.token || authData.data?.token)
    }
    
    return authData
  }

  /**
   * 로그아웃 함수
   */
  const logout = () => {
    setToken(null)
    setAdmin(null)
    localStorage.removeItem('adminToken')
    localStorage.removeItem('adminInfo')
  }

  // Context에 제공할 값
  const value = {
    admin,
    token,
    loading,
    login,
    logout,
    isAuthenticated: !!token
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

