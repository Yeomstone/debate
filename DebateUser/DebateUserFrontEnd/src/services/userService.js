/**
 * 사용자 서비스 (User Service)
 *
 * 사용자 관련 API 호출을 담당하는 서비스입니다.
 *
 * 주요 기능:
 * - 사용자 정보 조회 (ID로)
 * - 프로필 수정
 */

import api from "./api";

export const userService = {
  /**
   * 사용자 정보 조회 (ID로)
   *
   * 사용자 ID로 사용자 정보를 가져옵니다.
   *
   * @param {number} id - 사용자 ID
   * @returns {Promise<Object>} ApiResponse 구조의 응답 데이터
   * @returns {Object} response.data - UserResponse (사용자 정보)
   */
  async getUserById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  /**
   * 프로필 수정
   *
   * 현재 로그인한 사용자의 프로필을 수정합니다. 인증이 필요합니다.
   *
   * @param {string} nickname - 닉네임 (선택사항)
   * @param {string} bio - 자기소개 (선택사항)
   * @param {string} profileImage - 프로필 이미지 URL (선택사항)
   * @returns {Promise<Object>} ApiResponse 구조의 응답 데이터
   * @returns {Object} response.data - UserResponse (수정된 사용자 정보)
   */
  async updateProfile(nickname, bio, profileImage) {
    const response = await api.put("/users/me", null, {
      params: { nickname, bio, profileImage },
    });
    return response.data;
  },

  /**
   * 프로필 이미지 업로드
   * 
   * @param {File} file - 업로드할 이미지 파일
   * @returns {Promise<string>} 업로드된 이미지 URL
   */
  async uploadImage(file) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload/profile', formData);
    // ApiResponse<String> 구조에서 data 필드가 URL임
    return response.data.data || response.data;
  },

  /**
   * 특정 사용자가 작성한 토론 목록 조회
   * 
   * @param {number} userId - 사용자 ID
   * @param {number} page - 페이지 번호 (0부터 시작)
   * @param {number} size - 페이지당 항목 수
   * @returns {Promise<Object>} 페이징된 토론 목록
   */
  async getUserDebates(userId, page = 0, size = 10) {
    const response = await api.get(`/users/${userId}/debates`, {
      params: { page, size }
    });
    return response.data;
  },

  /**
   * 특정 사용자가 작성한 댓글 목록 조회
   * 
   * @param {number} userId - 사용자 ID
   * @param {number} page - 페이지 번호 (0부터 시작)
   * @param {number} size - 페이지당 항목 수
   * @returns {Promise<Object>} 페이징된 댓글 목록
   */
  async getUserComments(userId, page = 0, size = 10) {
    const response = await api.get(`/users/${userId}/comments`, {
      params: { page, size }
    });
    return response.data;
  },
};

/**
 * 사용자 랭킹 조회 (기간 및 기준별)
 * @param {number} limit - 조회할 상위 사용자 수
 * @param {string} period - 기간 (daily, monthly, yearly, all)
 * @param {string} criteria - 기준 (likes, votes, comments)
 * @returns {Promise} 사용자 랭킹 목록
 */
export const getUserRanking = async (limit = 10, period = 'all', criteria = 'likes') => {
  try {
    const response = await api.get("/users/ranking", {
      params: { limit, period, criteria },
    });
    return response.data;
  } catch (error) {
    console.error("랭킹 조회 실패:", error);
    throw error;
  }
};
