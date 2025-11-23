// 파일: src/pages/DebateListPage.jsx
import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { debateService } from "../services/debateService";
import { categoryService } from "../services/categoryService";
import DebateCard from "../components/debate/DebateCard";
import "./DebateListPage.css";

/**
 * DebateListPage 컴포넌트
 * 전문적이고 가독성 높은 UI로 개선된 토론 목록 페이지
 */
const DebateListPage = () => {
  const location = useLocation();

  const [debates, setDebates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentLoadedPage, setCurrentLoadedPage] = useState(0);

  // 필터 상태
  const [categoryId, setCategoryId] = useState(
    location.state?.categoryId || ""
  );
  const [status, setStatus] = useState(location.state?.status || "");
  const [sort, setSort] = useState(location.state?.sort || "latest");
  const [keyword, setKeyword] = useState(location.state?.keyword || "");
  const [searchInput, setSearchInput] = useState(location.state?.keyword || "");

  useEffect(() => {
    if (location.state) {
      const {
        categoryId: stateCategoryId,
        status: stateStatus,
        sort: stateSort,
        keyword: stateKeyword,
      } = location.state;
      if (stateCategoryId !== undefined) setCategoryId(stateCategoryId);
      if (stateStatus !== undefined) setStatus(stateStatus);
      if (stateSort !== undefined) setSort(stateSort);
      if (stateKeyword !== undefined) {
        setKeyword(stateKeyword);
        setSearchInput(stateKeyword);
      }
      setPage(0);
      setCurrentLoadedPage(0);
    }
  }, [location.state]);

  useEffect(() => {
    if (page === 0 || page !== currentLoadedPage) {
      fetchDebates();
      setCurrentLoadedPage(page);
    }
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categoryId, status, sort, page, keyword]);

  const fetchDebates = async (append = false) => {
    try {
      if (append) setLoadingMore(true);
      else setLoading(true);

      let response;
      if (keyword && keyword.trim()) {
        response = await debateService.searchDebates(
          keyword,
          categoryId ? parseInt(categoryId) : undefined,
          status || undefined,
          sort,
          page,
          10
        );
      } else if (categoryId) {
        response = await debateService.getDebatesByCategory(
          parseInt(categoryId),
          page,
          10,
          sort,
          status || undefined
        );
      } else {
        response = await debateService.getAllDebates(
          page,
          10,
          sort,
          status || undefined
        );
      }

      const pageData = response.data || response;

      if (append) {
        setDebates((prev) => [...prev, ...(pageData.content || [])]);
      } else {
        setDebates(pageData.content || []);
      }
      setTotalPages(pageData.totalPages || 0);
    } catch (error) {
      console.error("토론 목록 로딩 실패:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      const data = response.data || response;
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("카테고리 로딩 실패:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setPage(0);
    setCurrentLoadedPage(0);
    switch (key) {
      case "category":
        setCategoryId(value || "");
        break;
      case "status":
        setStatus(value || "");
        break;
      case "sort":
        setSort(value || "latest");
        break;
      default:
        break;
    }
  };

  const handleLoadMore = async () => {
    const nextPage = currentLoadedPage + 1;
    if (nextPage < totalPages && !loadingMore) {
      setLoadingMore(true);
      try {
        let response;
        if (keyword && keyword.trim()) {
          response = await debateService.searchDebates(
            keyword,
            categoryId ? parseInt(categoryId) : undefined,
            status || undefined,
            sort,
            nextPage,
            10
          );
        } else if (categoryId) {
          response = await debateService.getDebatesByCategory(
            parseInt(categoryId),
            nextPage,
            10,
            sort
          );
        } else {
          response = await debateService.getAllDebates(nextPage, 10, sort);
        }
        const pageData = response.data || response;
        setDebates((prev) => [...prev, ...(pageData.content || [])]);
        setTotalPages(pageData.totalPages || 0);
        setCurrentLoadedPage(nextPage);
      } catch (error) {
        console.error("더보기 로딩 실패:", error);
      } finally {
        setLoadingMore(false);
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const trimmedKeyword = searchInput.trim();
    setKeyword(trimmedKeyword);
    setPage(0);
    setCurrentLoadedPage(0);
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setKeyword("");
    setPage(0);
    setCurrentLoadedPage(0);
  };

  if (loading && page === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="debate-list-page">
      <div className="container">
        <div className="debate-header-section">
          <div className="header-content">
            <h1>토론 목록</h1>
            <p>다양한 주제로 자유롭게 의견을 나누어보세요.</p>
          </div>
          <Link to="/debate/create" className="create-debate-btn">
            <span>✏️</span> 새 토론 시작하기
          </Link>
        </div>

        {/* 검색 및 필터 바 */}
        <div className="search-filter-bar">
          <form onSubmit={handleSearch} className="search-wrapper">
            <div className="search-input-group">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="관심 있는 토론 주제를 검색해보세요"
                className="modern-search-input"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="clear-btn"
                >
                  ✕
                </button>
              )}
            </div>
            <button type="submit" className="search-btn">
              검색
            </button>
          </form>

          <div className="filters-wrapper">
            <select
              className="modern-select"
              value={categoryId}
              onChange={(e) => handleFilterChange("category", e.target.value)}
            >
              <option value="">모든 카테고리</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              className="modern-select"
              value={status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
            >
              <option value="">모든 상태</option>
              <option value="SCHEDULED">예정됨</option>
              <option value="ACTIVE">진행중</option>
              <option value="ENDED">종료됨</option>
            </select>
            <select
              className="modern-select sort-select"
              value={sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
            >
              <option value="latest">최신순</option>
              <option value="popular">인기순</option>
              <option value="comments">댓글순</option>
              <option value="views">조회순</option>
            </select>
          </div>
        </div>

        {keyword && (
          <div className="search-result-info">
            <span className="highlight">'{keyword}'</span> 검색 결과
            <button onClick={handleClearSearch} className="reset-search-link">
              전체 목록 보기
            </button>
          </div>
        )}

        {/* 토론 목록 그리드 */}
        <div className="debate-grid">
          {debates.length === 0 ? (
            <div className="empty-state-modern">
              <div className="empty-icon">📭</div>
              <h3>찾으시는 토론이 없습니다</h3>
              <p>검색어를 변경하거나 새로운 토론을 시작해보세요.</p>
              <Link to="/debate/create" className="btn-text">
                새 토론 만들기 &rarr;
              </Link>
            </div>
          ) : (
            debates.map((debate) => (
              <DebateCard
                key={debate.id}
                debate={debate}
                filterState={{ categoryId, status, sort, keyword }}
              />
            ))
          )}
        </div>

        {/* 페이지네이션 / 더보기 */}
        {totalPages > 0 && (
          <div className="pagination-wrapper">
            <div className="desktop-pagination">
              <button
                className="page-control"
                onClick={() => setPage(Math.max(0, page - 1))}
                disabled={page === 0}
              >
                &lt; 이전
              </button>
              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => {
                  // 페이지 번호가 많을 경우 처리 (현재 페이지 주변만 표시 등)
                  if (
                    totalPages > 7 &&
                    Math.abs(page - i) > 3 &&
                    i !== 0 &&
                    i !== totalPages - 1
                  ) {
                    if (Math.abs(page - i) === 4)
                      return (
                        <span key={i} className="ellipsis">
                          ...
                        </span>
                      );
                    return null;
                  }
                  return (
                    <button
                      key={i}
                      className={`page-number ${page === i ? "active" : ""}`}
                      onClick={() => setPage(i)}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <button
                className="page-control"
                onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                disabled={page === totalPages - 1}
              >
                다음 &gt;
              </button>
            </div>

            {currentLoadedPage < totalPages - 1 && (
              <button
                className="mobile-load-more-btn"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "로딩 중..." : "더 보기"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DebateListPage;
