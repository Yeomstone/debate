/**
 * 관리자 댓글 관리 서비스
 */

import api from './api'

export const getComments = async (params = {}) => {
  const { keyword, isHidden, page = 0, size = 20 } = params
  const response = await api.get('/admin/comments', {
    params: { keyword, isHidden, page, size }
  })
  return response
}

export const getCommentsByDebate = async (debateId, page = 0, size = 20, sort = 'createdAt,desc') => {
  const response = await api.get(`/admin/comments/debate/${debateId}`, {
    params: { page, size, sort }
  })
  return response
}

export const getCommentDetail = async (id) => {
  const response = await api.get(`/admin/comments/${id}`)
  return response
}

export const toggleCommentHidden = async (id) => {
  const response = await api.put(`/admin/comments/${id}/toggle-hidden`)
  return response
}

export const deleteComment = async (id) => {
  const response = await api.delete(`/admin/comments/${id}`)
  return response
}

export const adminCommentService = {
  getComments,
  getCommentsByDebate,
  getCommentDetail,
  toggleCommentHidden,
  deleteComment
}

