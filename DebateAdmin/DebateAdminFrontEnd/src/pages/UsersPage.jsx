/**
 * 회원 관리 페이지
 * 
 * 회원 목록 조회, 검색, 상태 변경, 삭제 기능을 제공합니다.
 */

import { useEffect, useState } from 'react'
import { adminUserService } from '../services/adminUserService'
import { format } from 'date-fns'
import UserAvatar from '../components/common/UserAvatar'
import './UsersPage.css'

const UsersPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [statusToChange, setStatusToChange] = useState('')

  useEffect(() => {
    loadUsers()
  }, [currentPage, statusFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await adminUserService.getUsers({
        keyword: searchKeyword || undefined,
        status: statusFilter || undefined,
        page: currentPage,
        size: 20
      })

      const data = response.data?.data || response.data || response
      if (data.content) {
        setUsers(data.content)
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      } else if (Array.isArray(data)) {
        setUsers(data)
        setTotalPages(1)
        setTotalElements(data.length)
      }
    } catch (error) {
      console.error('회원 목록 로딩 실패:', error)
      alert('회원 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(0)
    loadUsers()
  }

  const handleStatusChange = async (userId, newStatus) => {
    if (!window.confirm(`회원 상태를 ${getStatusLabel(newStatus)}로 변경하시겠습니까?`)) {
      return
    }

    try {
      await adminUserService.updateUserStatus(userId, newStatus)
      alert('회원 상태가 변경되었습니다.')
      loadUsers()
      setShowStatusModal(false)
    } catch (error) {
      console.error('회원 상태 변경 실패:', error)
      alert('회원 상태 변경에 실패했습니다.')
    }
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('정말 이 회원을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    try {
      await adminUserService.deleteUser(userId)
      alert('회원이 삭제되었습니다.')
      loadUsers()
    } catch (error) {
      console.error('회원 삭제 실패:', error)
      alert('회원 삭제에 실패했습니다.')
    }
  }

  const handleViewDetail = async (userId) => {
    try {
      const response = await adminUserService.getUserDetail(userId)
      const data = response.data?.data || response.data || response
      setSelectedUser(data)
      setShowDetailModal(true)
    } catch (error) {
      console.error('회원 상세 조회 실패:', error)
      alert('회원 정보를 불러오는데 실패했습니다.')
    }
  }

  const getStatusLabel = (status) => {
    const statusMap = {
      ACTIVE: '정상',
      SUSPENDED: '정지',
      DELETED: '탈퇴'
    }
    return statusMap[status] || status
  }

  const getStatusBadgeClass = (status) => {
    const classMap = {
      ACTIVE: 'status-active',
      SUSPENDED: 'status-suspended',
      DELETED: 'status-deleted'
    }
    return classMap[status] || ''
  }

  return (
    <div className="users-page">
      {/* 검색 및 필터 */}
      <div className="page-header">
        <h1>회원 관리</h1>
        <div className="search-filter-bar">
          <input
            type="text"
            className="search-input"
            placeholder="이메일 또는 닉네임으로 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(0)
            }}
          >
            <option value="">전체 상태</option>
            <option value="ACTIVE">정상</option>
            <option value="SUSPENDED">정지</option>
            <option value="DELETED">탈퇴</option>
          </select>
          <button className="btn btn-primary" onClick={handleSearch}>
            검색
          </button>
        </div>
      </div>

      {/* 회원 목록 */}
      <div className="content-card">
        {loading ? (
          <div className="admin-loading">로딩 중...</div>
        ) : (
          <>
            <div className="table-info">
              <span>총 {totalElements}명</span>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>이메일</th>
                  <th>닉네임</th>
                  <th>상태</th>
                  <th>가입일시</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>{user.email}</td>
                      <td>
                        <div className="author-cell">
                          <UserAvatar
                            src={user.profileImage}
                            alt={user.nickname || "회원"}
                            size="small"
                          />
                          <span>{user.nickname}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(user.status)}`}>
                          {getStatusLabel(user.status)}
                        </span>
                      </td>
                      <td>
                        {user.createdAt
                          ? format(new Date(user.createdAt), 'yyyy-MM-dd HH:mm')
                          : '-'}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleViewDetail(user.id)}
                          >
                            상세
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setStatusToChange(user.status)
                              setShowStatusModal(true)
                            }}
                          >
                            상태변경
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(user.id)}
                            disabled={user.status === 'DELETED'}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '2rem' }}>
                      회원이 없습니다
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

      {/* 회원 상세 모달 */}
      {showDetailModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>회원 상세 정보</h2>
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
                <span>{selectedUser.id}</span>
              </div>
              <div className="detail-row">
                <label>이메일:</label>
                <span>{selectedUser.email}</span>
              </div>
              <div className="detail-row">
                <label>닉네임:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserAvatar
                    src={selectedUser.profileImage}
                    alt={selectedUser.nickname || "회원"}
                    size="medium"
                  />
                  <span>{selectedUser.nickname}</span>
                </div>
              </div>
              <div className="detail-row">
                <label>상태:</label>
                <span className={`status-badge ${getStatusBadgeClass(selectedUser.status)}`}>
                  {getStatusLabel(selectedUser.status)}
                </span>
              </div>
              {selectedUser.profileImage && (
                <div className="detail-row">
                  <label>프로필 이미지:</label>
                  <span>{selectedUser.profileImage}</span>
                </div>
              )}
              {selectedUser.bio && (
                <div className="detail-row">
                  <label>자기소개:</label>
                  <span>{selectedUser.bio}</span>
                </div>
              )}
              <div className="detail-row">
                <label>가입일시:</label>
                <span>
                  {selectedUser.createdAt
                    ? format(new Date(selectedUser.createdAt), 'yyyy-MM-dd HH:mm:ss')
                    : '-'}
                </span>
              </div>
              <div className="detail-row">
                <label>수정일시:</label>
                <span>
                  {selectedUser.updatedAt
                    ? format(new Date(selectedUser.updatedAt), 'yyyy-MM-dd HH:mm:ss')
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

      {/* 상태 변경 모달 */}
      {showStatusModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowStatusModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>회원 상태 변경</h2>
              <button
                className="modal-close"
                onClick={() => setShowStatusModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>회원:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserAvatar
                    src={selectedUser.profileImage}
                    alt={selectedUser.nickname || "회원"}
                    size="small"
                  />
                  <span>{selectedUser.nickname} ({selectedUser.email})</span>
                </div>
              </div>
              <div className="detail-row">
                <label>현재 상태:</label>
                <span className={`status-badge ${getStatusBadgeClass(selectedUser.status)}`}>
                  {getStatusLabel(selectedUser.status)}
                </span>
              </div>
              <div className="detail-row">
                <label>변경할 상태:</label>
                <select
                  className="form-select"
                  value={statusToChange}
                  onChange={(e) => setStatusToChange(e.target.value)}
                >
                  <option value="ACTIVE">정상</option>
                  <option value="SUSPENDED">정지</option>
                  <option value="DELETED">탈퇴</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowStatusModal(false)}
              >
                취소
              </button>
              <button
                className="btn btn-primary"
                onClick={() => handleStatusChange(selectedUser.id, statusToChange)}
                disabled={statusToChange === selectedUser.status}
              >
                변경
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersPage
