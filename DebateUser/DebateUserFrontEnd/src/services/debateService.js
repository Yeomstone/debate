/**
 * 토론 서비스 (Debate Service)
 * 
 * 토론 관련 API 호출을 담당하는 서비스입니다.
 * 
 * 주요 기능:
 * - 토론 목록 조회 (페이징)
 * - 토론 상세 조회
 * - 토론 생성
 * - 토론 삭제
 * - 카테고리별 토론 조회
 * - 토론 검색
 */

import api from './api'

export const debateService = {
  /**
   * 전체 토론 목록 조회
   * 
   * 페이징된 토론 목록을 가져옵니다.
   * 
   * @param {number} page - 페이지 번호 (0부터 시작)
   * @param {number} size - 페이지당 항목 수
   * @param {string} sort - 정렬 기준 (latest, popular, comments, views)
   * @returns {Promise<Object>} ApiResponse 구조의 응답 데이터
   * @returns {Object} response.data - Page<DebateResponse> (페이징된 토론 목록)
   */
  async getAllDebates(page = 0, size = 20, sort = 'latest', status = null) {
    const params = { page, size, sort }
    if (status) params.status = status
    const response = await api.get('/debate', { params })
    return response.data
  },

  /**
   * 토론 상세 정보 조회
   * 
   * ID로 특정 토론의 상세 정보를 가져옵니다.
   * 
   * @param {number} id - 토론 ID
   * @returns {Promise<Object>} ApiResponse 구조의 응답 데이터
   * @returns {Object} response.data - DebateResponse (토론 상세 정보)
   */
  async getDebateById(id) {
    const response = await api.get(`/debate/${id}`)
    return response.data
  },

  /**
   * 토론 생성
   * 
   * 새로운 토론을 생성합니다. 인증이 필요합니다.
   * 
   * @param {Object} debateData - 토론 생성 데이터
   * @param {string} debateData.title - 토론 제목
   * @param {string} debateData.content - 토론 내용
   * @param {number} debateData.categoryId - 카테고리 ID
   * @param {string} debateData.startDate - 시작일시 (ISO 8601 형식)
   * @param {string} debateData.endDate - 종료일시 (ISO 8601 형식)
   * @returns {Promise<Object>} ApiResponse 구조의 응답 데이터
   * @returns {Object} response.data - DebateResponse (생성된 토론 정보)
   */
  async createDebate(debateData) {
    const response = await api.post('/debate', debateData)
    return response.data
  },

  /**
   * 토론 삭제
   * 
   * 토론을 삭제합니다. 작성자만 삭제 가능하며, 토론이 시작되기 전(SCHEDULED 상태)에만 삭제 가능합니다.
   * 
   * @param {number} id - 삭제할 토론 ID
   * @returns {Promise<Object>} ApiResponse 구조의 응답 데이터
   */
  async deleteDebate(id) {
    const response = await api.delete(`/debate/${id}`)
    return response.data
  },

  /**
   * 카테고리별 토론 목록 조회
   * 
   * 특정 카테고리의 토론 목록을 페이징하여 가져옵니다.
   * 
   * @param {number} categoryId - 카테고리 ID
   * @param {number} page - 페이지 번호 (0부터 시작)
   * @param {number} size - 페이지당 항목 수
   * @param {string} sort - 정렬 기준 (latest, popular, comments, views)
   * @returns {Promise<Object>} ApiResponse 구조의 응답 데이터
   * @returns {Object} response.data - Page<DebateResponse> (페이징된 토론 목록)
   */
  async getDebatesByCategory(categoryId, page = 0, size = 20, sort = 'latest', status = null) {
    const params = { page, size, sort }
    if (status) params.status = status
    const response = await api.get(`/debate/category/${categoryId}`, {
      params,
    })
    return response.data
  },

  /**
   * 토론 검색
   * 
   * 키워드로 토론을 검색합니다. 제목과 내용에서 검색됩니다.
   * 카테고리, 상태, 정렬 필터를 지원합니다.
   * 
   * @param {string} keyword - 검색 키워드
   * @param {number} [categoryId] - 카테고리 ID (선택적)
   * @param {string} [status] - 토론 상태 (선택적: SCHEDULED, ACTIVE, ENDED)
   * @param {string} [sort] - 정렬 기준 (선택적: latest, popular, comments, views)
   * @param {number} page - 페이지 번호 (0부터 시작)
   * @param {number} size - 페이지당 항목 수
   * @returns {Promise<Object>} ApiResponse 구조의 응답 데이터
   * @returns {Object} response.data - Page<DebateResponse> (검색된 토론 목록)
   */
  async searchDebates(keyword, categoryId, status, sort, page = 0, size = 20) {
    const params = { keyword, page, size }
    if (categoryId) params.categoryId = categoryId
    if (status) params.status = status
    if (sort) params.sort = sort
    
    const response = await api.get('/debate/search', { params })
    return response.data
  },

  /**
   * 토론 수정
   * 
   * 토론을 수정합니다. 작성자만 수정 가능하며, 토론이 시작되기 전에만 수정 가능합니다.
   * 인증이 필요합니다.
   * 
   * @param {number} id - 토론 ID
   * @param {Object} debateData - 토론 수정 데이터
   * @param {string} [debateData.title] - 토론 제목 (선택적)
   * @param {string} [debateData.content] - 토론 내용 (선택적)
   * @param {number} [debateData.categoryId] - 카테고리 ID (선택적)
   * @param {string} [debateData.startDate] - 시작일시 (ISO 8601 형식, 선택적)
   * @param {string} [debateData.endDate] - 종료일시 (ISO 8601 형식, 선택적)
   * @returns {Promise<Object>} ApiResponse 구조의 응답 데이터
   * @returns {Object} response.data - DebateResponse (수정된 토론 정보)
   */
  async updateDebate(id, debateData) {
    const response = await api.put(`/debate/${id}`, debateData)
    return response.data
  },
}

