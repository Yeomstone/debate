/**
 * API 클라이언트 설정
 * 
 * Axios를 사용한 HTTP 클라이언트 설정 파일입니다.
 * 모든 API 요청은 이 인스턴스를 통해 이루어집니다.
 * 
 * 주요 기능:
 * - 요청 인터셉터: JWT 토큰 자동 추가
 * - 응답 인터셉터: 에러 처리 및 ApiResponse 구조 변환
 * - 인증 실패 시 자동 로그아웃 처리
 */

import axios from 'axios'

// API 기본 URL 설정
// 환경 변수 VITE_API_BASE_URL이 있으면 사용, 없으면 /api 사용 (Vite 프록시)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

/**
 * Axios 인스턴스 생성
 * 
 * 기본 설정:
 * - baseURL: API 서버 주소
 * - headers: JSON 콘텐츠 타입 설정
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * 요청 인터셉터
 * 
 * 모든 API 요청 전에 실행됩니다.
 * - localStorage에서 JWT 토큰을 가져와 Authorization 헤더에 추가
 * - 토큰이 있으면 Bearer 토큰 형식으로 자동 추가
 */
api.interceptors.request.use(
  (config) => {
    // localStorage에서 저장된 토큰 가져오기
    const token = localStorage.getItem('adminToken')
    if (token) {
      // Authorization 헤더에 Bearer 토큰 추가
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // FormData를 사용하는 경우 Content-Type을 제거
    // (브라우저가 자동으로 multipart/form-data와 boundary를 설정)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']
    }
    
    return config
  },
  (error) => {
    // 요청 설정 중 에러 발생 시 에러 반환
    return Promise.reject(error)
  }
)

/**
 * 응답 인터셉터
 * 
 * 모든 API 응답 후에 실행됩니다.
 * - BackEnd의 ApiResponse 구조를 처리
 * - 인증 실패(401, 403) 시 자동 로그아웃 처리
 */
api.interceptors.response.use(
  (response) => {
    /**
     * BackEnd의 ApiResponse 구조: { success: boolean, message: string, data: T }
     * axios는 response.data에 ApiResponse를 담아서 반환
     * 
     * ApiResponse 구조가 있으면 그대로 반환, 없으면 response.data 반환
     */
    const apiResponse = response.data
    if (apiResponse && apiResponse.data !== undefined) {
      return apiResponse
    }
    return response.data
  },
  (error) => {
    // 401 Unauthorized 또는 403 Forbidden 에러 처리 (인증 실패 또는 권한 없음)
    if (error.response?.status === 401 || error.response?.status === 403) {
      // 토큰 제거
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminInfo')
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login'
    }
    // 에러를 그대로 전달하여 각 컴포넌트에서 처리할 수 있도록 함
    return Promise.reject(error)
  }
)

export default api

