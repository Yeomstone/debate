/**
 * 토론 관리 페이지
 * 
 * 토론 목록 조회, 검색/필터링, 수정/삭제, 숨김 처리, 상태 변경 기능을 제공합니다.
 */

import { useEffect, useState, useRef, useMemo } from 'react'
import { adminDebateService } from '../services/adminDebateService'
import { fileUploadService } from '../services/fileUploadService'
import { format } from 'date-fns'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import ImageUploadModal from '../components/common/ImageUploadModal'
import './DebatePage.css'

const DebatePage = () => {
  const [debates, setDebates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [hiddenFilter, setHiddenFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [selectedDebate, setSelectedDebate] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: '',
    startDate: '',
    endDate: ''
  })
  const quillRef = useRef(null) // React Quill ref
  const [isImageModalOpen, setIsImageModalOpen] = useState(false) // 이미지 업로드 모달 상태

  useEffect(() => {
    loadDebates()
  }, [currentPage, statusFilter, hiddenFilter])

  const loadDebates = async () => {
    try {
      setLoading(true)
      const response = await adminDebateService.getDebates({
        keyword: searchKeyword || undefined,
        status: statusFilter || undefined,
        isHidden: hiddenFilter || undefined,
        page: currentPage,
        size: 20
      })

      // API 인터셉터가 ApiResponse를 반환하므로 response.data가 실제 데이터
      const data = response.data || response
      if (data && data.content) {
        setDebates(data.content)
        setTotalPages(data.totalPages || 0)
        setTotalElements(data.totalElements || 0)
      } else if (Array.isArray(data)) {
        setDebates(data)
        setTotalPages(1)
        setTotalElements(data.length)
      } else {
        console.error('예상하지 못한 응답 형식:', data)
        alert('토론 목록을 불러오는데 실패했습니다.')
      }
    } catch (error) {
      console.error('토론 목록 로딩 실패:', error)
      alert('토론 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(0)
    loadDebates()
  }

  const handleViewDetail = async (id) => {
    try {
      const response = await adminDebateService.getDebateDetail(id)
      const data = response.data?.data || response.data || response
      setSelectedDebate(data)
      setShowDetailModal(true)
    } catch (error) {
      console.error('토론 상세 조회 실패:', error)
      alert('토론 정보를 불러오는데 실패했습니다.')
    }
  }

  const handleEdit = (debate) => {
    setSelectedDebate(debate)
    setEditFormData({
      title: debate.title || '',
      content: debate.content || '',
      startDate: debate.startDate
        ? format(new Date(debate.startDate), "yyyy-MM-dd'T'HH:mm")
        : '',
      endDate: debate.endDate
        ? format(new Date(debate.endDate), "yyyy-MM-dd'T'HH:mm")
        : ''
    })
    setShowEditModal(true)
  }

  const handleUpdate = async () => {
    if (!selectedDebate) return

    try {
      await adminDebateService.updateDebate(selectedDebate.id, editFormData)
      alert('토론이 수정되었습니다.')
      loadDebates()
      setShowEditModal(false)
    } catch (error) {
      console.error('토론 수정 실패:', error)
      alert('토론 수정에 실패했습니다.')
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    if (!window.confirm(`토론 상태를 ${getStatusLabel(newStatus)}로 변경하시겠습니까?`)) {
      return
    }

    try {
      await adminDebateService.updateDebateStatus(id, newStatus)
      alert('토론 상태가 변경되었습니다.')
      loadDebates()
    } catch (error) {
      console.error('토론 상태 변경 실패:', error)
      alert('토론 상태 변경에 실패했습니다.')
    }
  }

  const handleToggleHidden = async (id) => {
    try {
      await adminDebateService.toggleDebateHidden(id)
      alert('숨김 상태가 변경되었습니다.')
      loadDebates()
    } catch (error) {
      console.error('숨김 상태 변경 실패:', error)
      alert('숨김 상태 변경에 실패했습니다.')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('정말 이 토론을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    try {
      await adminDebateService.deleteDebate(id)
      alert('토론이 삭제되었습니다.')
      loadDebates()
    } catch (error) {
      console.error('토론 삭제 실패:', error)
      alert('토론 삭제에 실패했습니다.')
    }
  }

  const getStatusLabel = (status) => {
    const statusMap = {
      SCHEDULED: '예정',
      ACTIVE: '진행중',
      ENDED: '종료'
    }
    return statusMap[status] || status
  }

  const getStatusBadgeClass = (status) => {
    const classMap = {
      SCHEDULED: 'status-scheduled',
      ACTIVE: 'status-active',
      ENDED: 'status-ended'
    }
    return classMap[status] || ''
  }

  /**
   * React Quill 에디터 모듈 설정
   * 이미지 업로드 핸들러 포함
   * useMemo로 메모이제이션하여 불필요한 재렌더링 방지
   */
  const quillModules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }], // 텍스트 정렬 (좌측, 중앙, 우측, 양쪽 정렬)
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image', 'blockquote', 'code-block'],
        ['clean']
      ],
      handlers: {
        /**
         * 이미지 업로드 핸들러
         * 모달을 열어 이미지 URL 입력 또는 파일 업로드 지원
         */
        image: function() {
          // 모달 열기
          setIsImageModalOpen(true)
        },
        /**
         * 링크 핸들러 개선
         * 링크 추가/수정 시 URL 입력
         */
        link: function(value) {
          const quill = quillRef.current?.getEditor() || this.quill
          if (value) {
            const href = prompt('링크 URL을 입력하세요:')
            if (href) {
              // URL 형식 검증
              let url = href
              if (!href.startsWith('http://') && !href.startsWith('https://')) {
                url = 'https://' + href
              }
              const range = quill.getSelection(true)
              if (range) {
                quill.formatText(range.index, range.length, 'link', url, 'user')
              }
            }
          } else {
            quill.format('link', false)
          }
        }
      }
    },
    // 이미지 리사이즈 모듈 설정
    imageResize: {
      parchment: Quill.import('parchment'),
      modules: ['Resize', 'DisplaySize', 'Toolbar'],
      handleStyles: {
        backgroundColor: 'black',
        border: 'none',
        color: 'white'
      },
      displayStyles: {
        backgroundColor: 'black',
        border: 'none',
        color: 'white'
      },
      toolbarStyles: {
        backgroundColor: 'black',
        border: 'none',
        color: 'white'
      }
    }
  }), [])

  /**
   * React Quill 에디터 포맷 설정
   * useMemo로 메모이제이션하여 불필요한 재렌더링 방지
   */
  const quillFormats = useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align', // 텍스트 정렬
    'color', 'background',
    'link', 'image', 'blockquote', 'code-block'
  ], [])

  /**
   * 이미지 URL 제출 처리
   * 모달에서 URL을 입력받아 에디터에 삽입
   */
  const handleImageUrlSubmit = (url) => {
    const quill = quillRef.current?.getEditor()
    if (quill) {
      const range = quill.getSelection(true)
      quill.insertEmbed(range.index, 'image', url, 'user')
    }
  }

  /**
   * 이미지 파일 선택 처리
   * 모달에서 파일을 선택받아 업로드 후 에디터에 삽입
   */
  const handleImageFileSelect = async (file) => {
    try {
      // 백엔드에 이미지 업로드
      const imageUrl = await fileUploadService.uploadImage(file)
      
      // 이미지 URL이 상대 경로인 경우 절대 경로로 변환
      // React Quill은 에디터 내부에서 이미지를 로드할 때 현재 origin을 사용하므로
      // 상대 경로가 작동하지 않을 수 있습니다.
      let finalImageUrl = imageUrl
      if (imageUrl && !imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:')) {
        // 상대 경로인 경우 현재 origin과 결합
        finalImageUrl = `${window.location.origin}${imageUrl}`
      }
      
      // 업로드된 이미지 URL을 에디터에 삽입
      const quill = quillRef.current?.getEditor()
      if (quill) {
        const range = quill.getSelection(true)
        quill.insertEmbed(range.index, 'image', finalImageUrl, 'user')
      }
    } catch (error) {
      console.error('이미지 업로드 실패:', error)
      alert('이미지 업로드에 실패했습니다.')
    }
  }

  return (
    <div className="debate-page">
      {/* 검색 및 필터 */}
      <div className="page-header">
        <h1>토론 관리</h1>
        <div className="search-filter-bar">
          <input
            type="text"
            className="search-input"
            placeholder="제목 또는 내용으로 검색..."
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
            <option value="SCHEDULED">예정</option>
            <option value="ACTIVE">진행중</option>
            <option value="ENDED">종료</option>
          </select>
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

      {/* 토론 목록 */}
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
                  <th>제목</th>
                  <th>작성자</th>
                  <th>상태</th>
                  <th>시작일시</th>
                  <th>종료일시</th>
                  <th>조회수</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {debates.length > 0 ? (
                  debates.map((debate) => (
                    <tr key={debate.id} className={debate.isHidden ? 'hidden-row' : ''}>
                      <td>{debate.id}</td>
                      <td>
                        <div className="title-cell">
                          {debate.isHidden && <span className="hidden-badge">숨김</span>}
                          {debate.title}
                        </div>
                      </td>
                      <td>{debate.user?.nickname || debate.userId || '-'}</td>
                      <td>
                        <span className={`status-badge ${getStatusBadgeClass(debate.status)}`}>
                          {getStatusLabel(debate.status)}
                        </span>
                      </td>
                      <td>
                        {debate.startDate
                          ? format(new Date(debate.startDate), 'yyyy-MM-dd HH:mm')
                          : '-'}
                      </td>
                      <td>
                        {debate.endDate
                          ? format(new Date(debate.endDate), 'yyyy-MM-dd HH:mm')
                          : '-'}
                      </td>
                      <td>{debate.viewCount || 0}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleViewDetail(debate.id)}
                          >
                            상세
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleEdit(debate)}
                          >
                            수정
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleToggleHidden(debate.id)}
                          >
                            {debate.isHidden ? '공개' : '숨김'}
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(debate.id)}
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
                      토론이 없습니다
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

      {/* 토론 상세 모달 */}
      {showDetailModal && selectedDebate && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>토론 상세 정보</h2>
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
                <span>{selectedDebate.id}</span>
              </div>
              <div className="detail-row">
                <label>제목:</label>
                <span>{selectedDebate.title}</span>
              </div>
              <div className="detail-row">
                <label>내용:</label>
                <div className="content-display">{selectedDebate.content}</div>
              </div>
              <div className="detail-row">
                <label>작성자:</label>
                <span>{selectedDebate.user?.nickname || selectedDebate.userId || '-'}</span>
              </div>
              <div className="detail-row">
                <label>상태:</label>
                <span className={`status-badge ${getStatusBadgeClass(selectedDebate.status)}`}>
                  {getStatusLabel(selectedDebate.status)}
                </span>
              </div>
              <div className="detail-row">
                <label>숨김 여부:</label>
                <span>{selectedDebate.isHidden ? '숨김' : '공개'}</span>
              </div>
              <div className="detail-row">
                <label>시작일시:</label>
                <span>
                  {selectedDebate.startDate
                    ? format(new Date(selectedDebate.startDate), 'yyyy-MM-dd HH:mm:ss')
                    : '-'}
                </span>
              </div>
              <div className="detail-row">
                <label>종료일시:</label>
                <span>
                  {selectedDebate.endDate
                    ? format(new Date(selectedDebate.endDate), 'yyyy-MM-dd HH:mm:ss')
                    : '-'}
                </span>
              </div>
              <div className="detail-row">
                <label>조회수:</label>
                <span>{selectedDebate.viewCount || 0}</span>
              </div>
              <div className="detail-row">
                <label>생성일시:</label>
                <span>
                  {selectedDebate.createdAt
                    ? format(new Date(selectedDebate.createdAt), 'yyyy-MM-dd HH:mm:ss')
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

      {/* 토론 수정 모달 */}
      {showEditModal && selectedDebate && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>토론 수정</h2>
              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>제목:</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>내용:</label>
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={editFormData.content}
                  onChange={(value) =>
                    setEditFormData({ ...editFormData, content: value })
                  }
                  placeholder="토론 내용을 입력하세요"
                  modules={quillModules}
                  formats={quillFormats}
                />
              </div>
              <div className="form-group">
                <label>시작일시:</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={editFormData.startDate}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, startDate: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>종료일시:</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={editFormData.endDate}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, endDate: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                취소
              </button>
              <button className="btn btn-primary" onClick={handleUpdate}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 업로드 모달 */}
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onUrlSubmit={handleImageUrlSubmit}
        onFileSelect={handleImageFileSelect}
      />
    </div>
  )
}

export default DebatePage

