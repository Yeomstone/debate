/**
 * 의견 서비스 (Opinion Service)
 * 
 * 토론에 대한 사용자 의견(찬성/반대) 관련 API 호출을 담당하는 서비스입니다.
 * 
 * 주요 기능:
 * - 토론에 대한 의견 작성 (찬성 또는 반대)
 * - 토론별 의견 목록 조회
 */

import api from './api'

export const opinionService = {
  /**
   * 의견 작성
   * 
   * 토론에 대한 의견(찬성 또는 반대)을 작성합니다. 인증이 필요합니다.
   * 
   * @param {Object} opinionData - 의견 작성 데이터
   * @param {number} opinionData.debateId - 토론 ID
   * @param {string} opinionData.side - 의견 방향 ('FOR' 또는 'AGAINST')
   * @param {string} opinionData.content - 의견 내용
   * @returns {Promise<Object>} ApiResponse 구조의 응답 데이터
   * @returns {Object} response.data - OpinionResponse (작성된 의견 정보)
   */
  async createOpinion(opinionData) {
    const response = await api.post('/opinions', opinionData)
    return response.data
  },

  /**
   * 토론별 의견 목록 조회
   * 
   * 특정 토론의 모든 의견(찬성/반대) 목록을 가져옵니다.
   * 
   * @param {number} debateId - 토론 ID
   * @returns {Promise<Object>} ApiResponse 구조의 응답 데이터
   * @returns {Array} response.data - OpinionResponse[] (의견 목록)
   */
  async getOpinionsByDebate(debateId) {
    const response = await api.get(`/opinions/debate/${debateId}`)
    return response.data
  },
}

