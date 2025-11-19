/**
 * 좋아요 서비스 (Like Service)
 * 
 * 토론 좋아요 관련 API 호출을 담당하는 서비스입니다.
 * 
 * 주요 기능:
 * - 토론 좋아요 토글 (좋아요 추가/제거)
 * - 토론 좋아요 여부 확인
 */

import api from './api'

export const likeService = {
  /**
   * 좋아요 토글
   * 
   * 토론에 좋아요를 추가하거나 제거합니다. 인증이 필요합니다.
   * 이미 좋아요를 누른 경우 제거되고, 누르지 않은 경우 추가됩니다.
   * 
   * @param {number} debateId - 토론 ID
   * @returns {Promise<Object>} ApiResponse 구조의 응답 데이터
   * @returns {Object} response.data - 좋아요 상태 정보
   */
  async toggleLike(debateId) {
    const response = await api.post(`/likes/debate/${debateId}`)
    return response.data
  },

  /**
   * 좋아요 여부 확인
   * 
   * 현재 로그인한 사용자가 특정 토론에 좋아요를 눌렀는지 확인합니다.
   * 인증이 필요합니다.
   * 
   * @param {number} debateId - 토론 ID
   * @returns {Promise<Object>} ApiResponse 구조의 응답 데이터
   * @returns {boolean} response.data - 좋아요 여부 (true/false)
   */
  async isLiked(debateId) {
    const response = await api.get(`/likes/debate/${debateId}`)
    return response.data
  },
}

