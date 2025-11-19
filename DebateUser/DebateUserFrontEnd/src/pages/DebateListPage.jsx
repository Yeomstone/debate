/**
 * DebateListPage 컴포넌트
 * 
 * 토론 목록 페이지입니다.
 * 
 * 주요 기능:
 * - 토론 목록 표시 (페이징)
 * - 카테고리별 필터링
 * - 상태별 필터링 (예정, 진행중, 종료)
 * - 정렬 기능 (최신순, 인기순, 댓글 많은순, 조회수순)
 * - 페이지네이션
 */

import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { debateService } from '../services/debateService'
import { categoryService } from '../services/categoryService'
import DebateCard from '../components/debate/DebateCard'
import './DebateListPage.css'

/**
 * DebateListPage 컴포넌트
 * 
 * @returns {JSX.Element} 토론 목록 페이지 컴포넌트
 */
const DebateListPage = () => {
  const location = useLocation() // 현재 위치 정보 (필터 조건 복원용)
  
  // 상태 관리 (URL 변경 없이 React 상태로만 관리)
  const [debates, setDebates] = useState([]) // 토론 목록
  const [categories, setCategories] = useState([]) // 카테고리 목록
  const [loading, setLoading] = useState(true) // 로딩 상태
  const [page, setPage] = useState(0) // 현재 페이지 번호
  const [totalPages, setTotalPages] = useState(0) // 전체 페이지 수
  const [isMobile, setIsMobile] = useState(false) // 모바일 여부
  const [loadingMore, setLoadingMore] = useState(false) // 더보기 로딩 상태
  const [currentLoadedPage, setCurrentLoadedPage] = useState(0) // 현재 로드된 페이지 추적 (더보기용)
  
  // 필터 상태 (URL 변경 없이)
  // location.state에서 필터 조건 복원 (상세 페이지에서 돌아올 때)
  const [categoryId, setCategoryId] = useState(location.state?.categoryId || '') // 카테고리 필터
  const [status, setStatus] = useState(location.state?.status || '') // 상태 필터
  const [sort, setSort] = useState(location.state?.sort || 'latest') // 정렬 필터
  const [keyword, setKeyword] = useState(location.state?.keyword || '') // 검색어
  const [searchInput, setSearchInput] = useState(location.state?.keyword || '') // 검색 입력 필드

  /**
   * 모바일 사이즈 감지
   */
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  /**
   * location.state에서 필터 조건 복원 (상세 페이지에서 돌아올 때)
   */
  useEffect(() => {
    if (location.state) {
      const { categoryId: stateCategoryId, status: stateStatus, sort: stateSort, keyword: stateKeyword } = location.state
      
      // 필터 조건이 있으면 복원
      if (stateCategoryId !== undefined) setCategoryId(stateCategoryId)
      if (stateStatus !== undefined) setStatus(stateStatus)
      if (stateSort !== undefined) setSort(stateSort)
      if (stateKeyword !== undefined) {
        setKeyword(stateKeyword)
        setSearchInput(stateKeyword)
      }
      
      // 페이지 초기화
      setPage(0)
      setCurrentLoadedPage(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state])


  /**
   * 필터 또는 페이지 변경 시 데이터 로딩
   * 더보기로 로드한 페이지가 아닐 때만 실행 (중복 호출 방지)
   */
  useEffect(() => {
    // 더보기로 로드한 페이지가 아닐 때만 실행 (필터 변경 또는 첫 페이지 로드)
    // currentLoadedPage는 의존성 배열에 포함하지 않음 (더보기에서만 업데이트)
    if (page === 0 || page !== currentLoadedPage) {
      fetchDebates()
      setCurrentLoadedPage(page) // 현재 페이지 추적
    }
    fetchCategories()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, status, sort, page, keyword])

  /**
   * 토론 목록 가져오기
   * 
   * 검색어가 있으면 검색 API를 사용하고 (필터 포함),
   * 없으면 카테고리 필터에 따라 일반 목록 API를 사용합니다.
   * 
   * @param {boolean} append - 기존 목록에 추가할지 여부 (더보기 기능용)
   */
  const fetchDebates = async (append = false) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }
      
      let response
      
      // 검색어가 있으면 검색 API 사용 (카테고리, 상태, 정렬 필터 포함)
      if (keyword && keyword.trim()) {
        response = await debateService.searchDebates(
          keyword,
          categoryId ? parseInt(categoryId) : undefined,
          status || undefined,
          sort,
          page,
          10
        )
      } else if (categoryId) {
        // 카테고리 필터가 있으면 카테고리별 토론 가져오기
        response = await debateService.getDebatesByCategory(parseInt(categoryId), page, 10, sort, status || undefined)
      } else {
        // 전체 토론 목록 가져오기
        response = await debateService.getAllDebates(page, 10, sort, status || undefined)
      }
      
      // ApiResponse 구조에서 data 추출
      const pageData = response.data || response
      
      if (append) {
        // 더보기: 기존 목록에 추가
        setDebates(prev => [...prev, ...(pageData.content || [])])
      } else {
        // 새로 로드: 기존 목록 교체
        setDebates(pageData.content || [])
      }
      
      setTotalPages(pageData.totalPages || 0)
    } catch (error) {
      console.error('토론 목록 로딩 실패:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  /**
   * 카테고리 목록 가져오기
   * 
   * 필터 옵션에 사용할 카테고리 목록을 가져옵니다.
   */
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories()
      // ApiResponse 구조에서 data 추출
      const data = response.data || response
      setCategories(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('카테고리 로딩 실패:', error)
    }
  }

  /**
   * 필터 변경 처리
   * 
   * 필터 값이 변경되면 상태를 업데이트하고 페이지를 초기화합니다.
   * URL 변경 없이 React 상태만으로 처리합니다.
   * 
   * @param {string} key - 필터 키 (category, status, sort)
   * @param {string} value - 필터 값
   */
  const handleFilterChange = (key, value) => {
    // 필터 변경 시 페이지를 첫 페이지로 초기화
    setPage(0)
    setCurrentLoadedPage(0) // 페이지 추적 초기화
    
    // 필터 키에 따라 해당 상태 업데이트
    switch (key) {
      case 'category':
        setCategoryId(value || '')
        break
      case 'status':
        setStatus(value || '')
        break
      case 'sort':
        setSort(value || 'latest')
        break
      default:
        break
    }
  }

  /**
   * 더보기 버튼 클릭 처리 (모바일용)
   * 기존 목록에 다음 페이지 데이터를 추가합니다.
   * setPage를 호출하지 않아 useEffect가 재실행되지 않도록 합니다.
   */
  const handleLoadMore = async () => {
    const nextPage = currentLoadedPage + 1
    
    if (nextPage < totalPages && !loadingMore) {
      setLoadingMore(true)
      
      try {
        let response
        
        // 검색어가 있으면 검색 API 사용 (카테고리, 상태, 정렬 필터 포함)
        if (keyword && keyword.trim()) {
          response = await debateService.searchDebates(
            keyword,
            categoryId ? parseInt(categoryId) : undefined,
            status || undefined,
            sort,
            nextPage,
            10
          )
        } else if (categoryId) {
          // 카테고리 필터가 있으면 카테고리별 토론 가져오기
          response = await debateService.getDebatesByCategory(parseInt(categoryId), nextPage, 10, sort)
        } else {
          // 전체 토론 목록 가져오기
          response = await debateService.getAllDebates(nextPage, 10, sort)
        }
        
        // ApiResponse 구조에서 data 추출
        const pageData = response.data || response
        
        // 더보기: 기존 목록에 추가 (기존 데이터는 유지)
        setDebates(prev => [...prev, ...(pageData.content || [])])
        setTotalPages(pageData.totalPages || 0)
        
        // 페이지 추적 업데이트 (내부적으로만 관리, useEffect 재실행 방지)
        setCurrentLoadedPage(nextPage)
        // setPage를 호출하지 않음 - useEffect가 재실행되지 않도록
      } catch (error) {
        console.error('더보기 로딩 실패:', error)
      } finally {
        setLoadingMore(false)
      }
    }
  }

  /**
   * 검색 처리
   * 
   * 검색어를 상태로 설정하고 페이지를 초기화합니다.
   * URL 변경 없이 React 상태만으로 처리합니다.
   * 
   * @param {Event} e - 폼 제출 이벤트
   */
  const handleSearch = (e) => {
    e.preventDefault()
    const trimmedKeyword = searchInput.trim()
    setKeyword(trimmedKeyword)
    setPage(0) // 검색 시 페이지를 첫 페이지로 초기화
    setCurrentLoadedPage(0) // 페이지 추적 초기화
  }

  /**
   * 검색어 초기화
   */
  const handleClearSearch = () => {
    setSearchInput('')
    setKeyword('')
    setPage(0)
    setCurrentLoadedPage(0) // 페이지 추적 초기화
  }

  if (loading) {
    return <div className="container">로딩 중...</div>
  }

  return (
    <div className="debate-list-page">
      <div className="container">
        <div className="page-header">
          <h1>토론 목록</h1>
          <Link to="/debate/create" className="btn btn-primary">
            새 토론 작성
          </Link>
        </div>

        {/* 필터 및 정렬 */}
        <div className="filter-section">
          <div className="filters">
            <select
              className="form-select"
              value={categoryId}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">전체 카테고리</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              className="form-select"
              value={status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">전체 상태</option>
              <option value="SCHEDULED">예정</option>
              <option value="ACTIVE">진행중</option>
              <option value="ENDED">종료</option>
            </select>
            <select
              className="form-select"
              value={sort}
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="latest">정렬: 최신순</option>
              <option value="popular">인기순</option>
              <option value="comments">댓글 많은순</option>
              <option value="views">조회수순</option>
            </select>
          </div>
          
          {/* 검색 영역 */}
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-box">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="토론 제목, 내용으로 검색..."
                className="search-input"
              />
              <button type="submit" className="btn btn-primary">
                검색
              </button>
              {keyword && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="btn btn-outline"
                >
                  초기화
                </button>
              )}
            </div>
          </form>
          {keyword && (
            <div className="search-info">
              <span>'{keyword}' 검색 결과</span>
            </div>
          )}
        </div>

        {/* 토론 목록 */}
        <div className="debate-list">
          {debates.length === 0 ? (
            <div className="empty-state">
              <p>토론이 없습니다.</p>
            </div>
          ) : (
            debates.map((debate) => (
              <DebateCard 
                key={debate.id} 
                debate={debate}
                filterState={{
                  categoryId,
                  status,
                  sort,
                  keyword
                }}
              />
            ))
          )}
        </div>

        {/* 페이지네이션 (데스크톱) / 더보기 (모바일) */}
        {totalPages > 0 && (
          <>
            {/* 데스크톱: 기존 페이징 */}
            <div className="pagination desktop-pagination">
              <button
                className="page-link"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                이전
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`page-link ${page === i ? 'active' : ''}`}
                  onClick={() => setPage(i)}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="page-link"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
              >
                다음
              </button>
            </div>

            {/* 모바일: 더보기 버튼 */}
            {currentLoadedPage < totalPages - 1 && (
              <div className="load-more mobile-load-more">
                <button
                  className="btn btn-outline load-more-btn"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? '로딩 중...' : '더보기'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default DebateListPage

