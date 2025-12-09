/**
 * ProtectedRoute 컴포넌트
 * 
 * 인증이 필요한 관리자 페이지를 보호하는 컴포넌트입니다.
 * JWT 토큰 유효성 검증 포함
 */

import { Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect, useState } from 'react'

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

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, token, logout } = useAuth()
  const [isValid, setIsValid] = useState(true)

  useEffect(() => {
    // 토큰이 있으면 유효성 검증
    if (token) {
      if (!isTokenValid(token)) {
        // 토큰이 만료되었으면 로그아웃 처리
        logout()
        setIsValid(false)
      } else {
        setIsValid(true)
      }
    } else {
      setIsValid(false)
    }
  }, [token, logout])

  if (loading) {
    return <div className="admin-loading">로딩 중...</div>
  }

  if (!isAuthenticated || !isValid) {
    return <Navigate to="/login" replace />
  }

  return children
}

export default ProtectedRoute

