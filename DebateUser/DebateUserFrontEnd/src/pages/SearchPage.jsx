/**
 * SearchPage 컴포넌트
 *
 * 토론 검색 페이지입니다.
 *
 * 주요 기능:
 * - 검색어 입력 및 검색 실행
 * - 검색 결과 목록 표시
 * - URL 쿼리 파라미터를 통한 검색어 전달
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { debateService } from "../services/debateService";
import DebateCard from "../components/debate/DebateCard";
import "./SearchPage.css";

/**
 * SearchPage 컴포넌트
 *
 * @returns {JSX.Element} 검색 페이지 컴포넌트
 */
const SearchPage = () => {
  // 훅 사용
  const [searchParams] = useSearchParams(); // URL 쿼리 파라미터 관리

  // URL에서 검색어 가져오기
  const keyword = searchParams.get("q") || "";

  // 상태 관리
  const [debates, setDebates] = useState([]); // 검색 결과 토론 목록
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [searchKeyword, setSearchKeyword] = useState(keyword); // 검색어 입력값

  /**
   * URL의 검색어 변경 시 검색 실행
   */
  useEffect(() => {
    if (keyword) {
      performSearch(keyword);
    }
  }, [keyword]);

  /**
   * 검색 실행
   *
   * 검색어로 토론을 검색합니다.
   *
   * @param {string} query - 검색어
   */
  const performSearch = async (query) => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      const response = await debateService.searchDebates(query);
      // ApiResponse 구조에서 data 추출
      const pageData = response.data || response;
      setDebates(pageData.content || []);
    } catch (error) {
      console.error("검색 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * 검색 폼 제출 처리
   *
   * 검색어를 URL 쿼리 파라미터로 전달하여 검색 페이지로 이동합니다.
   *
   * @param {Event} e - 폼 제출 이벤트
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      // 검색어를 URL 쿼리 파라미터로 전달하여 페이지 이동
      window.location.href = `/search?q=${encodeURIComponent(searchKeyword)}`;
    }
  };

  return (
    <div className="search-page">
      <div className="container">
        <h1>검색</h1>
        <form onSubmit={handleSubmit} className="search-form">
          <div className="search-box">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="검색어를 입력하세요..."
              className="search-input"
            />
            <button type="submit" className="btn btn-primary">
              검색
            </button>
          </div>
        </form>

        {keyword && (
          <div className="search-results">
            <h2>'{keyword}' 검색 결과</h2>
            {loading ? (
              <div>검색 중...</div>
            ) : debates.length === 0 ? (
              <div className="empty-state">검색 결과가 없습니다.</div>
            ) : (
              <div className="debate-list">
                {debates.map((debate) => (
                  <DebateCard key={debate.id} debate={debate} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
