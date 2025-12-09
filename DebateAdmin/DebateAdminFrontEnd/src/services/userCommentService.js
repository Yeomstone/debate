/**
 * 유저 댓글 서비스 (관리자 사이트에서 유저 API 호출용)
 * 
 * 관리자 사이트에서 유저 API를 호출하여 댓글을 가져오는 서비스입니다.
 */

import axios from 'axios'

// 유저 API 기본 URL
// 관리자 사이트(admin.debate.me.kr)에서 유저 API(debate.me.kr)를 호출
// CORS 문제를 피하기 위해 같은 프로토콜과 포트를 사용
const getBaseURL = () => {
  if (import.meta.env.VITE_USER_API_BASE_URL) {
    return import.meta.env.VITE_USER_API_BASE_URL
  }
  
  // 현재 도메인에서 admin.을 제거하여 유저 도메인으로 변환
  const currentOrigin = window.location.origin
  if (currentOrigin.includes('admin.')) {
    return currentOrigin.replace('admin.', '') + '/api'
  }
  
  // 로컬 개발 환경인 경우
  if (currentOrigin.includes('localhost') || currentOrigin.includes('127.0.0.1')) {
    return 'http://localhost:9001/api'
  }
  
  // 기본값
  return '/api'
}

const USER_API_BASE_URL = getBaseURL()

// 유저 API용 axios 인스턴스 (인증 없이 호출 - 댓글 조회는 공개 API)
const userApi = axios.create({
  baseURL: USER_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 응답 인터셉터: ApiResponse 구조 처리
userApi.interceptors.response.use(
  (response) => {
    const apiResponse = response.data
    // ApiResponse 구조: { success, message, data: { content, totalPages, ... } }
    if (apiResponse && typeof apiResponse === 'object' && 'data' in apiResponse) {
      return apiResponse
    }
    // 직접 데이터가 반환된 경우
    return response.data
  },
  (error) => {
    console.error('댓글 API 호출 실패:', error)
    // 에러 상세 정보 로깅
    if (error.response) {
      console.error('응답 상태:', error.response.status)
      console.error('응답 데이터:', error.response.data)
    } else if (error.request) {
      console.error('요청 전송 실패:', error.request)
    }
    return Promise.reject(error)
  }
)

export const userCommentService = {
  /**
   * 토론별 댓글 목록 조회
   * 
   * @param {number} debateId - 토론 ID
   * @param {number} page - 페이지 번호 (0부터 시작)
   * @param {number} size - 페이지당 항목 수
   * @param {string} sort - 정렬 기준 (예: 'createdAt,desc')
   * @returns {Promise<Object>} ApiResponse 구조의 응답 데이터
   */
  async getCommentsByDebate(debateId, page = 0, size = 20, sort = 'createdAt,desc') {
    try {
      console.log('댓글 API 호출:', `${USER_API_BASE_URL}/comments/debate/${debateId}`, { page, size, sort })
      const response = await userApi.get(`/comments/debate/${debateId}`, {
        params: { page, size, sort },
      })
      console.log('댓글 API 응답:', response)
      return response
    } catch (error) {
      console.error('댓글 조회 실패:', error)
      throw error
    }
  },
}

