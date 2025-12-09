/**
 * 댓글 관리 페이지
 * 
 * 댓글 목록 조회, 검색, 숨김 처리, 삭제 기능을 제공합니다.
 */

import { useEffect, useState } from 'react'
import { adminCommentService } from '../services/adminCommentService'
import { format } from 'date-fns'
import UserAvatar from '../components/common/UserAvatar'
import './CommentsPage.css'

const CommentsPage = () => {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [hiddenFilter, setHiddenFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [selectedComment, setSelectedComment] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  useEffect(() => {
    loadComments()
  }, [currentPage, hiddenFilter])

  const loadComments = async () => {
    try {
      setLoading(true)
      const response = await adminCommentService.getComments({
        keyword: searchKeyword || undefined,
        isHidden: hiddenFilter || undefined,
        page: currentPage,
        size: 20
      })

      // API 인터셉터가 ApiResponse를 반환하므로 response.data가 실제 데이터
      const data = response.data || response
      if (data && data.content) {
        setComments(data.content)
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      } else if (Array.isArray(data)) {
        setComments(data)
        setTotalPages(1)
        setTotalElements(data.length)
      } else {
        console.error('예상하지 못한 응답 형식:', data)
        alert('댓글 목록을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('댓글 목록 로딩 실패:', error)
      alert('댓글 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(0)
    loadComments()
  }

  const handleViewDetail = async (id) => {
    try {
      const response = await adminCommentService.getCommentDetail(id)
      const data = response.data?.data || response.data || response
      setSelectedComment(data)
      setShowDetailModal(true)
    } catch (error) {
      console.error('댓글 상세 조회 실패:', error)
      alert('댓글 정보를 불러오는데 실패했습니다.')
    }
  }

  const handleToggleHidden = async (id) => {
    try {
      await adminCommentService.toggleCommentHidden(id)
      alert('숨김 상태가 변경되었습니다.')
      loadComments()
    } catch (error) {
      console.error('숨김 상태 변경 실패:', error)
      alert('숨김 상태 변경에 실패했습니다.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('정말 이 댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    try {
      await adminCommentService.deleteComment(id)
      alert('댓글이 삭제되었습니다.')
      loadComments()
    } catch (error) {
      console.error('댓글 삭제 실패:', error)
      alert('댓글 삭제에 실패했습니다.')
    }
  }

  return (
    <div className="comments-page">
      {/* 검색 및 필터 */}
      <div className="page-header">
        <h1>댓글 관리</h1>
        <div className="search-filter-bar">
          <input
            type="text"
            className="search-input"
            placeholder="댓글 내용으로 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <select
            className="filter-select"
            value={hiddenFilter}
            onChange={(e) => {
              setHiddenFilter(e.target.value)
              setCurrentPage(0)
            }}
          >
            <option value="">전체</option>
            <option value="false">공개</option>
            <option value="true">숨김</option>
          </select>
          <button className="btn btn-primary" onClick={handleSearch}>
            검색
          </button>
        </div>
      </div>

      {/* 댓글 목록 */}
      <div className="content-card">
        {loading ? (
          <div className="admin-loading">로딩 중...</div>
        ) : (
          <>
            <div className="table-info">
              <span>총 {totalElements}개</span>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>내용</th>
                  <th>작성자</th>
                  <th>토론 ID</th>
                  <th>대댓글 여부</th>
                  <th>숨김</th>
                  <th>작성일시</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <tr
                      key={comment.id}
                      className={comment.isHidden ? 'hidden-row' : ''}
                    >
                      <td>{comment.id}</td>
                      <td>
                        <div className="content-cell">
                          {comment.isHidden && <span className="hidden-badge">숨김</span>}
                          <span className="content-preview">
                            {comment.content?.length > 50
                              ? comment.content.substring(0, 50) + '...'
                              : comment.content}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="author-cell">
                          <UserAvatar
                            src={comment.user?.profileImage}
                            alt={comment.user?.nickname || comment.userId || "작성자"}
                            size="small"
                          />
                          <span>{comment.user?.nickname || comment.userId || '-'}</span>
                        </div>
                      </td>
                      <td>{comment.debateId || '-'}</td>
                      <td>
                        {comment.parentId ? (
                          <span className="reply-badge">대댓글</span>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                      <td>{comment.isHidden ? '숨김' : '공개'}</td>
                      <td>
                        {comment.createdAt
                          ? format(new Date(comment.createdAt), 'yyyy-MM-dd HH:mm')
                          : '-'}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleViewDetail(comment.id)}
                          >
                            상세
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleToggleHidden(comment.id)}
                          >
                            {comment.isHidden ? '공개' : '숨김'}
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(comment.id)}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                      댓글이 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* 페이징 */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                  disabled={currentPage === 0}
                >
                  이전
                </button>
                <span className="page-info">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                  }
                  disabled={currentPage >= totalPages - 1}
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 댓글 상세 모달 */}
      {showDetailModal && selectedComment && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>댓글 상세 정보</h2>
              <button
                className="modal-close"
                onClick={() => setShowDetailModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>ID:</label>
                <span>{selectedComment.id}</span>
              </div>
              <div className="detail-row">
                <label>내용:</label>
                <div className="content-display">{selectedComment.content}</div>
              </div>
              <div className="detail-row">
                <label>작성자:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserAvatar
                    src={selectedComment.user?.profileImage}
                    alt={selectedComment.user?.nickname || selectedComment.userId || "작성자"}
                    size="medium"
                  />
                  <span>
                    {selectedComment.user?.nickname || selectedComment.userId || '-'}
                  </span>
                </div>
              </div>
              <div className="detail-row">
                <label>토론 ID:</label>
                <span>{selectedComment.debateId || '-'}</span>
              </div>
              <div className="detail-row">
                <label>부모 댓글 ID:</label>
                <span>{selectedComment.parentId || '-'}</span>
              </div>
              <div className="detail-row">
                <label>대댓글 여부:</label>
                <span>{selectedComment.parentId ? '대댓글' : '일반 댓글'}</span>
              </div>
              <div className="detail-row">
                <label>숨김 여부:</label>
                <span>{selectedComment.isHidden ? '숨김' : '공개'}</span>
              </div>
              <div className="detail-row">
                <label>작성일시:</label>
                <span>
                  {selectedComment.createdAt
                    ? format(new Date(selectedComment.createdAt), 'yyyy-MM-dd HH:mm:ss')
                    : '-'}
                </span>
              </div>
              <div className="detail-row">
                <label>수정일시:</label>
                <span>
                  {selectedComment.updatedAt
                    ? format(new Date(selectedComment.updatedAt), 'yyyy-MM-dd HH:mm:ss')
                    : '-'}
                </span>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDetailModal(false)}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommentsPage
