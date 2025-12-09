/**
 * 신고 관리 페이지
 * 
 * 신고 목록 조회, 상세 조회, 처리 기능을 제공합니다.
 */

import { useEffect, useState } from 'react'
import { adminReportService } from '../services/adminReportService'
import { format } from 'date-fns'
import UserAvatar from '../components/common/UserAvatar'
import './ReportsPage.css'

const ReportsPage = () => {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('PENDING')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [selectedReport, setSelectedReport] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showProcessModal, setShowProcessModal] = useState(false)
  const [processStatus, setProcessStatus] = useState('APPROVED')

  useEffect(() => {
    loadReports()
  }, [currentPage, statusFilter])

  const loadReports = async () => {
    try {
      setLoading(true)
      const response = await adminReportService.getReports({
        status: statusFilter || undefined,
        page: currentPage,
        size: 20
      })

      const data = response.data?.data || response.data || response
      if (data.content) {
        setReports(data.content)
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      } else if (Array.isArray(data)) {
        setReports(data)
        setTotalPages(1)
        setTotalElements(data.length)
      }
    } catch (error) {
      console.error('신고 목록 로딩 실패:', error)
      alert('신고 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDetail = async (id) => {
    try {
      const response = await adminReportService.getReportDetail(id)
      const data = response.data?.data || response.data || response
      setSelectedReport(data)
      setShowDetailModal(true)
    } catch (error) {
      console.error('신고 상세 조회 실패:', error)
      alert('신고 정보를 불러오는데 실패했습니다.')
    }
  }

  const handleProcess = (report) => {
    setSelectedReport(report)
    setProcessStatus('APPROVED')
    setShowProcessModal(true)
  }

  const handleProcessSubmit = async () => {
    if (!selectedReport) return

    try {
      await adminReportService.processReport(selectedReport.id, processStatus)
      alert(`신고가 ${getStatusLabel(processStatus)} 처리되었습니다.`)
      loadReports()
      setShowProcessModal(false)
    } catch (error) {
      console.error('신고 처리 실패:', error)
      alert('신고 처리에 실패했습니다.')
    }
  }

  const getStatusLabel = (status) => {
    const statusMap = {
      PENDING: '대기중',
      APPROVED: '승인',
      REJECTED: '반려'
    }
    return statusMap[status] || status
  }

  const getStatusBadgeClass = (status) => {
    const classMap = {
      PENDING: 'status-pending',
      APPROVED: 'status-approved',
      REJECTED: 'status-rejected'
    }
    return classMap[status] || ''
  }

  const getTargetTypeLabel = (type) => {
    const typeMap = {
      DEBATE: '토론',
      COMMENT: '댓글',
      USER: '사용자'
    }
    return typeMap[type] || type
  }

  return (
    <div className="reports-page">
      {/* 헤더 및 필터 */}
      <div className="page-header">
        <h1>신고 관리</h1>
        <div className="filter-bar">
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setCurrentPage(0)
            }}
          >
            <option value="">전체</option>
            <option value="PENDING">대기중</option>
            <option value="APPROVED">승인</option>
            <option value="REJECTED">반려</option>
          </select>
        </div>
      </div>

      {/* 신고 목록 */}
      <div className="content-card">
        {loading ? (
          <div className="admin-loading">로딩 중...</div>
        ) : (
          <>
            <div className="table-info">
              <span>총 {totalElements}개</span>
              {statusFilter === 'PENDING' && (
                <span className="pending-count">
                  미처리 신고: {reports.filter((r) => r.status === 'PENDING').length}개
                </span>
              )}
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>신고일시</th>
                  <th>신고자</th>
                  <th>대상 타입</th>
                  <th>대상 ID</th>
                  <th>신고 사유</th>
                  <th>상태</th>
                  <th>처리일시</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {reports.length > 0 ? (
                  reports.map((report) => (
                    <tr
                      key={report.id}
                      className={report.status === 'PENDING' ? 'urgent-row' : ''}
                    >
                      <td>{report.id}</td>
                      <td>
                        {report.createdAt
                          ? format(new Date(report.createdAt), 'yyyy-MM-dd HH:mm')
                          : '-'}
                      </td>
                      <td>
                        <div className="author-cell">
                          <UserAvatar
                            src={report.reporter?.profileImage}
                            alt={report.reporter?.nickname || report.reporterId || "신고자"}
                            size="small"
                          />
                          <span>{report.reporter?.nickname || report.reporterId || '-'}</span>
                        </div>
                      </td>
                      <td>{getTargetTypeLabel(report.targetType)}</td>
                      <td>{report.targetId}</td>
                      <td>
                        <span className="reason-text">
                          {report.reason?.length > 30
                            ? report.reason.substring(0, 30) + '...'
                            : report.reason}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(report.status)}`}>
                          {getStatusLabel(report.status)}
                        </span>
                      </td>
                      <td>
                        {report.processedAt
                          ? format(new Date(report.processedAt), 'yyyy-MM-dd HH:mm')
                          : '-'}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleViewDetail(report.id)}
                          >
                            상세
                          </button>
                          {report.status === 'PENDING' && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleProcess(report)}
                            >
                              처리
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" style={{ textAlign: 'center', padding: '2rem' }}>
                      신고가 없습니다
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

      {/* 신고 상세 모달 */}
      {showDetailModal && selectedReport && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>신고 상세 정보</h2>
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
                <span>{selectedReport.id}</span>
              </div>
              <div className="detail-row">
                <label>신고자:</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserAvatar
                    src={selectedReport.reporter?.profileImage}
                    alt={selectedReport.reporter?.nickname || selectedReport.reporterId || "신고자"}
                    size="medium"
                  />
                  <span>
                    {selectedReport.reporter?.nickname || selectedReport.reporterId || '-'}
                  </span>
                </div>
              </div>
              <div className="detail-row">
                <label>대상 타입:</label>
                <span>{getTargetTypeLabel(selectedReport.targetType)}</span>
              </div>
              <div className="detail-row">
                <label>대상 ID:</label>
                <span>{selectedReport.targetId}</span>
              </div>
              <div className="detail-row">
                <label>신고 사유:</label>
                <span>{selectedReport.reason}</span>
              </div>
              {selectedReport.description && (
                <div className="detail-row">
                  <label>상세 설명:</label>
                  <div className="content-display">{selectedReport.description}</div>
                </div>
              )}
              <div className="detail-row">
                <label>상태:</label>
                <span className={`status-badge ${getStatusBadgeClass(selectedReport.status)}`}>
                  {getStatusLabel(selectedReport.status)}
                </span>
              </div>
              {selectedReport.processedBy && (
                <div className="detail-row">
                  <label>처리 관리자:</label>
                  <span>
                    {selectedReport.processedBy?.name || selectedReport.processedBy || '-'}
                  </span>
                </div>
              )}
              <div className="detail-row">
                <label>신고일시:</label>
                <span>
                  {selectedReport.createdAt
                    ? format(new Date(selectedReport.createdAt), 'yyyy-MM-dd HH:mm:ss')
                    : '-'}
                </span>
              </div>
              {selectedReport.processedAt && (
                <div className="detail-row">
                  <label>처리일시:</label>
                  <span>
                    {format(new Date(selectedReport.processedAt), 'yyyy-MM-dd HH:mm:ss')}
                  </span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              {selectedReport.status === 'PENDING' && (
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    setShowDetailModal(false)
                    handleProcess(selectedReport)
                  }}
                >
                  처리하기
                </button>
              )}
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

      {/* 신고 처리 모달 */}
      {showProcessModal && selectedReport && (
        <div className="modal-overlay" onClick={() => setShowProcessModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>신고 처리</h2>
              <button
                className="modal-close"
                onClick={() => setShowProcessModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="detail-row">
                <label>신고 ID:</label>
                <span>{selectedReport.id}</span>
              </div>
              <div className="detail-row">
                <label>신고 사유:</label>
                <span>{selectedReport.reason}</span>
              </div>
              <div className="form-group">
                <label>처리 결과:</label>
                <select
                  className="form-select"
                  value={processStatus}
                  onChange={(e) => setProcessStatus(e.target.value)}
                >
                  <option value="APPROVED">승인</option>
                  <option value="REJECTED">반려</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowProcessModal(false)}
              >
                취소
              </button>
              <button className="btn btn-primary" onClick={handleProcessSubmit}>
                처리
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportsPage
