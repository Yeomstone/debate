/**
 * HomePage - 메인 홈페이지 컴포넌트 (API 연동 및 전체 코드 복원)
 *
 * 기능:
 * 1. HERO 섹션: 검색 기능 API 연동 준비
 * 2. 카테고리 섹션: 백엔드 카테고리 목록 조회 및 아이콘/색상 매핑
 * 3. 게시글 섹션: 최근/HOT 게시글 API 호출 및 데이터 바인딩
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import debateLogo from "../assets/debate-onlylogo.png";
import { categoryService } from "../services/categoryService";
import { debateService } from "../services/debateService";
import { format } from "date-fns"; // 날짜 포맷팅을 위해 사용
import "./HomePage.css";
import { useTheme } from "../context/ThemeContext";
import debateLogoLight from "../assets/debate-onlylogo.png";
import debateLogoDark from "../assets/debate-logo-dark.png";

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // === 상태 관리 ===
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [recentDebates, setRecentDebates] = useState([]);
  const [hotDebates, setHotDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const currentLogo = theme === "dark" ? debateLogoDark : debateLogoLight;

  // === 초기 데이터 로드 ===
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          loadCategories(),
          loadRecentDebates(),
          loadHotDebates(),
        ]);
      } catch (error) {
        console.error("홈 데이터 로딩 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // === 헬퍼 함수: 카테고리 스타일 매핑 ===
  // 백엔드에는 아이콘/색상 정보가 없으므로 프론트에서 순서대로 매핑
  const getCategoryStyle = (index) => {
    const styles = [
      { icon: "🏛️", color: "#FF6B6B" }, // 정치
      { icon: "💰", color: "#4ECDC4" }, // 경제
      { icon: "👥", color: "#45B7D1" }, // 사회
      { icon: "🎭", color: "#F7DC6F" }, // 문화
      { icon: "🔬", color: "#9B59B6" }, // 과학기술
      { icon: "🌱", color: "#27AE60" }, // 환경
      { icon: "📚", color: "#E67E22" }, // 교육
      { icon: "⚽", color: "#3498DB" }, // 스포츠
    ];
    // 스타일 배열 길이로 나눈 나머지를 사용하여 순환 할당
    return styles[index % styles.length];
  };

  // === 데이터 로딩 함수 ===

  /**
   * 카테고리 목록 로드
   */
  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
      // 데이터가 배열인지 확인
      const categoryList = Array.isArray(data) ? data : [];

      const mappedCategories = categoryList.map((cat, index) => {
        const style = getCategoryStyle(index);
        return {
          id: cat.id,
          name: cat.name,
          icon: style.icon,
          debateCount: cat.debateCount || 0,
          color: style.color,
        };
      });

      setCategories(mappedCategories);
    } catch (error) {
      console.error("카테고리 로드 실패:", error);
    }
  };

  /**
   * 최근 게시글 로드 (최신순 5개)
   */
  const loadRecentDebates = async () => {
    try {
      // page=0, size=5, sort='latest'
      const pageData = await debateService.getAllDebates(0, 5, "latest");
      const content = pageData.content || [];

      const mappedDebates = content.map((debate) => ({
        id: debate.id,
        title: debate.title,
        category: debate.categoryName,
        author: debate.nickname,
        views: debate.viewCount || 0,
        comments: debate.commentCount || 0,
        likes: debate.likeCount || 0,
        createdAt: debate.createdAt
          ? format(new Date(debate.createdAt), "yyyy-MM-dd")
          : "",
        status: debate.status ? debate.status.toLowerCase() : "scheduled",
      }));

      setRecentDebates(mappedDebates);
    } catch (error) {
      console.error("최근 게시글 로드 실패:", error);
    }
  };

  /**
   * HOT 게시글 로드 (인기순 5개)
   */
  const loadHotDebates = async () => {
    try {
      // page=0, size=5, sort='popular'
      const pageData = await debateService.getAllDebates(0, 5, "popular");
      const content = pageData.content || [];

      const mappedDebates = content.map((debate) => ({
        id: debate.id,
        title: debate.title,
        category: debate.categoryName,
        author: debate.nickname,
        views: debate.viewCount || 0,
        comments: debate.commentCount || 0,
        likes: debate.likeCount || 0,
        createdAt: debate.createdAt
          ? format(new Date(debate.createdAt), "yyyy-MM-dd")
          : "",
        status: debate.status ? debate.status.toLowerCase() : "scheduled",
      }));

      setHotDebates(mappedDebates);
    } catch (error) {
      console.error("핫 게시글 로드 실패:", error);
    }
  };

  // === 이벤트 핸들러 ===

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}`);
  };

  const handleDebateClick = (debateId) => {
    navigate(`/debate/${debateId}`);
  };

  // === 렌더링 ===

  return (
    <div className="home-page">
      {/* ===== Hero Section ===== */}
      <section className="hero-section">
        <div className="hero-content">
          {/* 로고 이미지 */}
          <div className="hero-logo">
            <img src={currentLogo} alt="DEBATE Logo" className="logo-image" />
          </div>

          <h1 className="hero-title">DEBATE</h1>

          <p className="hero-subtitle">
            다양한 주제로 토론하고, 의견을 나누며, 새로운 관점을 발견하세요
          </p>

          {/* 검색 박스 */}
          <form className="hero-search-form" onSubmit={handleSearch}>
            <div className="search-box">
              <svg
                className="search-icon"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
              </svg>
              <input
                type="text"
                className="search-input"
                placeholder="토론 주제를 검색해보세요..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className="search-button">
                검색
              </button>
            </div>
          </form>
        </div>

        {/* 배경 장식 */}
        <div className="hero-decoration">
          <div className="bubble bubble-1"></div>
          <div className="bubble bubble-2"></div>
          <div className="bubble bubble-3"></div>
        </div>
      </section>

      {/* ===== 카테고리 섹션 ===== */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">카테고리별 토론</h2>
            <p className="section-subtitle">
              관심 있는 주제의 카테고리를 선택해보세요
            </p>
          </div>

          {/* 카테고리 데이터가 로딩 중이거나 없을 때 처리 */}
          {loading && categories.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              로딩 중...
            </div>
          ) : (
            <div className="categories-grid">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="category-card"
                  onClick={() => handleCategoryClick(category.id)}
                  style={{ "--category-color": category.color }}
                >
                  <div className="category-icon">{category.icon}</div>
                  <h3 className="category-name">{category.name}</h3>
                  <p className="category-count">
                    {category.debateCount}개의 토론
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== 게시글 섹션 (최근 + 핫 좌우 분할) ===== */}
      <section className="debates-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">토론 둘러보기</h2>
          </div>

          <div className="debates-grid">
            {/* 왼쪽: 최근 게시글 */}
            <div className="debates-column">
              <div className="column-header">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <h3>최근 게시글</h3>
              </div>
              <div className="debates-list">
                {loading && recentDebates.length === 0 ? (
                  <div style={{ padding: "1rem" }}>로딩 중...</div>
                ) : recentDebates.length > 0 ? (
                  recentDebates.map((debate) => (
                    <div
                      key={debate.id}
                      className="debate-card"
                      onClick={() => handleDebateClick(debate.id)}
                    >
                      <div className="debate-card-header">
                        <span className="debate-category">
                          {debate.category}
                        </span>
                        <span
                          className={`debate-status status-${debate.status}`}
                        >
                          {debate.status === "active"
                            ? "진행중"
                            : debate.status === "ended"
                            ? "종료"
                            : "예정"}
                        </span>
                      </div>

                      <h3 className="debate-title">{debate.title}</h3>

                      <div className="debate-meta">
                        <span className="debate-author">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          {debate.author}
                        </span>
                        <span className="debate-date">{debate.createdAt}</span>
                      </div>

                      <div className="debate-stats">
                        <span className="stat-item">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          {debate.views.toLocaleString()}
                        </span>
                        <span className="stat-item">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          {debate.comments}
                        </span>
                        <span className="stat-item">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                          {debate.likes}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className="empty-message"
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      color: "#666",
                    }}
                  >
                    등록된 게시글이 없습니다.
                  </div>
                )}
              </div>
            </div>

            {/* 오른쪽: HOT 게시글 */}
            <div className="debates-column">
              <div className="column-header hot">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                </svg>
                <h3>HOT 게시글</h3>
              </div>
              <div className="debates-list">
                {loading && hotDebates.length === 0 ? (
                  <div style={{ padding: "1rem" }}>로딩 중...</div>
                ) : hotDebates.length > 0 ? (
                  hotDebates.map((debate) => (
                    <div
                      key={debate.id}
                      className="debate-card"
                      onClick={() => handleDebateClick(debate.id)}
                    >
                      <div className="debate-card-header">
                        <span className="debate-category">
                          {debate.category}
                        </span>
                        <span
                          className={`debate-status status-${debate.status}`}
                        >
                          {debate.status === "active"
                            ? "진행중"
                            : debate.status === "ended"
                            ? "종료"
                            : "예정"}
                        </span>
                      </div>

                      <h3 className="debate-title">{debate.title}</h3>

                      <div className="debate-meta">
                        <span className="debate-author">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                          </svg>
                          {debate.author}
                        </span>
                        <span className="debate-date">{debate.createdAt}</span>
                      </div>

                      <div className="debate-stats">
                        <span className="stat-item">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          {debate.views.toLocaleString()}
                        </span>
                        <span className="stat-item">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          {debate.comments}
                        </span>
                        <span className="stat-item">
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                          </svg>
                          {debate.likes}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div
                    className="empty-message"
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      color: "#666",
                    }}
                  >
                    등록된 HOT 게시글이 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 더보기 버튼 */}
          <div className="debates-footer">
            <button
              className="btn-debate btn-debate-secondary btn-debate-lg"
              onClick={() => navigate("/debate")}
            >
              모든 토론 보기
            </button>
          </div>
        </div>
      </section>

      {/* ===== CTA Section ===== */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2 className="cta-title">지금 바로 토론에 참여하세요!</h2>
            <p className="cta-description">
              다양한 주제로 여러분의 의견을 나누고, 새로운 시각을 발견해보세요.
            </p>
            {isAuthenticated ? (
              <button
                className="btn-debate btn-debate-primary btn-debate-lg"
                onClick={() => navigate("/debate/create")}
              >
                토론 시작하기
              </button>
            ) : (
              <button
                className="btn-debate btn-debate-primary btn-debate-lg"
                onClick={() => navigate("/auth/register")}
              >
                회원가입하기
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
