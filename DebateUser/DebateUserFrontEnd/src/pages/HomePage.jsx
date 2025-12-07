/**
 * HomePage - 메인 홈페이지 컴포넌트 (롯데 스타일 풀페이지)
 *
 * 수정사항:
 * 1. ✨ JavaScript 기반 풀페이지 스크롤 (롯데 스타일)
 * 2. 🎯 휠/키보드/터치로 섹션 단위 이동
 * 3. 📏 부드러운 CSS transform 애니메이션
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import debateLogo from "../assets/debate-onlylogo.png";
import { categoryService } from "../services/categoryService";
import { debateService } from "../services/debateService";
import { format } from "date-fns";
import "./HomePage.css";
import { useTheme } from "../context/ThemeContext";
import debateLogoLight from "../assets/debate-onlylogo.png";
import debateLogoDark from "../assets/debate-logo-dark.png";

const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const wrapperRef = useRef(null);

  // === 상태 관리 ===
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState([]);
  const [recentDebates, setRecentDebates] = useState([]);
  const [hotDebates, setHotDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeDebateTab, setActiveDebateTab] = useState("recent");
  const [currentSection, setCurrentSection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showFooter, setShowFooter] = useState(false); // 푸터 표시 상태

  const { theme } = useTheme();
  const currentLogo = theme === "dark" ? debateLogoDark : debateLogoLight;

  // 섹션 목록 (풀페이지 스크롤 대상)
  const sections = ["hero", "cta", "debates", "categories"];
  const totalSections = sections.length;

  // === 섹션 이동 함수 ===
  const goToSection = useCallback((index) => {
    if (isAnimating) return;
    if (index < 0 || index >= totalSections) return;

    setIsAnimating(true);
    setCurrentSection(index);
    setShowFooter(false); // 섹션 이동 시 푸터 숨김

    // 애니메이션 완료 후 상태 해제 (800ms = CSS transition 시간)
    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  }, [isAnimating, totalSections]);

  // === 휠 이벤트 핸들러 (쓰로틀링 적용) ===
  useEffect(() => {
    let lastWheelTime = 0;
    const wheelThrottle = 800; // 쓰로틀링
    const deltaThreshold = 30; // 최소 deltaY 값

    const handleWheel = (e) => {
      const now = Date.now();

      e.preventDefault();

      // 쓰로틀링
      if (now - lastWheelTime < wheelThrottle) return;
      if (isAnimating) return;

      // deltaY가 임계값보다 작으면 무시
      if (Math.abs(e.deltaY) < deltaThreshold) return;

      // 마지막 섹션(카테고리)인 경우 푸터 표시/숨김 처리
      if (currentSection === totalSections - 1) {
        if (e.deltaY > 0) { // 아래로 스크롤
          if (!showFooter) {
            setShowFooter(true);
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 800);
            lastWheelTime = now;
            return;
          }
          // 이미 푸터가 보이면 더 이상 스크롤 안 함
          return;
        } else if (e.deltaY < 0) { // 위로 스크롤
          if (showFooter) {
            setShowFooter(false);
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 800);
            lastWheelTime = now;
            return;
          }
          // 푸터가 숨겨진 상태에서 위로 스크롤하면 이전 섹션으로
          goToSection(currentSection - 1);
          lastWheelTime = now;
          return;
        }
      }

      // 일반 섹션 이동
      if (e.deltaY > 0) {
        goToSection(currentSection + 1);
        lastWheelTime = now;
      } else if (e.deltaY < 0) {
        goToSection(currentSection - 1);
        lastWheelTime = now;
      }
    };

    const wrapper = wrapperRef.current?.parentElement;
    if (wrapper) {
      wrapper.addEventListener("wheel", handleWheel, { passive: false });
      return () => wrapper.removeEventListener("wheel", handleWheel);
    }
  }, [currentSection, isAnimating, goToSection, totalSections, showFooter]);

  // === 키보드 이벤트 핸들러 ===
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isAnimating) return;

      // 마지막 섹션(카테고리)에서 푸터 처리
      if (currentSection === totalSections - 1) {
        if (["ArrowDown", "PageDown"].includes(e.key)) {
          e.preventDefault();
          if (!showFooter) {
            setShowFooter(true);
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 800);
          }
          return;
        } else if (["ArrowUp", "PageUp"].includes(e.key)) {
          e.preventDefault();
          if (showFooter) {
            setShowFooter(false);
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 800);
            return;
          }
          goToSection(currentSection - 1);
          return;
        }
      }

      switch (e.key) {
        case "ArrowDown":
        case "PageDown":
          e.preventDefault();
          goToSection(currentSection + 1);
          break;
        case "ArrowUp":
        case "PageUp":
          e.preventDefault();
          goToSection(currentSection - 1);
          break;
        case "Home":
          e.preventDefault();
          goToSection(0);
          break;
        case "End":
          e.preventDefault();
          goToSection(totalSections - 1);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSection, isAnimating, goToSection, totalSections, showFooter]);

  // === 터치 스와이프 핸들러 ===
  useEffect(() => {
    let touchStartY = 0;
    let touchEndY = 0;

    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
    };

    const handleTouchEnd = (e) => {
      if (isAnimating) return;
      touchEndY = e.changedTouches[0].clientY;
      const diff = touchStartY - touchEndY;

      if (Math.abs(diff) < 50) return;

      // 마지막 섹션(카테고리)에서 푸터 처리
      if (currentSection === totalSections - 1) {
        if (diff > 0) { // 위로 스와이프 (아래로 이동)
          if (!showFooter) {
            setShowFooter(true);
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 800);
          }
          return;
        } else { // 아래로 스와이프 (위로 이동)
          if (showFooter) {
            setShowFooter(false);
            setIsAnimating(true);
            setTimeout(() => setIsAnimating(false), 800);
            return;
          }
          goToSection(currentSection - 1);
          return;
        }
      }

      // 일반 섹션 이동
      if (diff > 0) {
        goToSection(currentSection + 1);
      } else {
        goToSection(currentSection - 1);
      }
    };

    const wrapper = wrapperRef.current?.parentElement;
    if (wrapper) {
      wrapper.addEventListener("touchstart", handleTouchStart, { passive: true });
      wrapper.addEventListener("touchend", handleTouchEnd, { passive: true });
      return () => {
        wrapper.removeEventListener("touchstart", handleTouchStart);
        wrapper.removeEventListener("touchend", handleTouchEnd);
      };
    }
  }, [currentSection, isAnimating, goToSection, totalSections, showFooter]);

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
    return styles[index % styles.length];
  };

  // === 데이터 로딩 함수 ===

  /**
   * 카테고리 목록 로드
   */
  const loadCategories = async () => {
    try {
      const data = await categoryService.getAllCategories();
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
   * 최근 게시글 로드 (최신순 4개로 줄임)
   */
  const loadRecentDebates = async () => {
    try {
      const pageData = await debateService.getAllDebates(0, 4, "latest");
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
   * HOT 게시글 로드 (인기순 4개로 줄임)
   */
  const loadHotDebates = async () => {
    try {
      const pageData = await debateService.getAllDebates(0, 4, "popular");
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

  // 페이지네이션 점 클릭
  const handleDotClick = (index) => {
    goToSection(index);
  };

  // 현재 탭에 맞는 게시글 가져오기
  const getCurrentDebates = () => {
    return activeDebateTab === "recent" ? recentDebates : hotDebates;
  };

  // === 렌더링 ===

  return (
    <div className="home-page">
      {/* ===== 페이지네이션 점 (롯데 스타일) ===== */}
      <div className="page-indicators">
        {sections.map((section, index) => (
          <button
            key={section}
            className={`page-dot ${currentSection === index ? "active" : ""}`}
            onClick={() => handleDotClick(index)}
            aria-label={`섹션 ${index + 1}로 이동`}
          >
            <span className="dot-inner"></span>
          </button>
        ))}
      </div>

      {/* ===== 풀페이지 래퍼 ===== */}
      <div
        className="fullpage-wrapper"
        ref={wrapperRef}
        style={{
          transform: `translateY(calc(-${currentSection * 100}vh${showFooter ? ' - 200px' : ''}))`,
        }}
      >
        {/* ===== 1. Hero Section ===== */}
        <section className="hero-section fullpage-section">
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

        {/* ===== 2. CTA Section ===== */}
        <section className="cta-section fullpage-section">
          {/* 떠다니는 파티클 */}
          <div className="cta-particles">
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
            <div className="particle"></div>
          </div>

          {/* 추가 글로우 효과 */}
          <div className="cta-glow"></div>

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

        {/* ===== 3. 토론 섹션 (탭 형식으로 변경) ===== */}
        <section className="debates-section fullpage-section">
          <div className="container">
            <div className="section-header">
              <h2 className="section-title">인기 토론</h2>
              <p className="section-subtitle">
                지금 가장 핫한 토론에 참여해보세요
              </p>
            </div>

            {/* 탭 버튼 */}
            <div className="debate-tabs">
              <button
                className={`tab-button ${activeDebateTab === "recent" ? "active" : ""}`}
                onClick={() => setActiveDebateTab("recent")}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
                최근 게시글
              </button>
              <button
                className={`tab-button ${activeDebateTab === "hot" ? "active" : ""}`}
                onClick={() => setActiveDebateTab("hot")}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
                </svg>
                HOT 게시글
              </button>
            </div>

            {/* 토론 리스트 */}
            <div className="debates-grid-compact">
              {loading && getCurrentDebates().length === 0 ? (
                <div className="loading-message">로딩 중...</div>
              ) : getCurrentDebates().length > 0 ? (
                getCurrentDebates().map((debate, index) => (
                  <div
                    key={debate.id}
                    className="debate-card-compact"
                    data-rank={index + 1}
                    onClick={() => handleDebateClick(debate.id)}
                  >
                    {/* 카테고리 & 상태 */}
                    <div className="debate-card-header">
                      <span className="debate-category">{debate.category}</span>
                      <span className={`debate-status status-${debate.status}`}>
                        {debate.status === "active"
                          ? "진행중"
                          : debate.status === "ended"
                            ? "종료"
                            : "예정"}
                      </span>
                    </div>

                    {/* 메인 콘텐츠 */}
                    <div className="debate-card-content">
                      <h3 className="debate-title">{debate.title}</h3>
                      <div className="debate-meta">
                        <span className="debate-author">
                          <svg
                            width="14"
                            height="14"
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
                    </div>

                    {/* 통계 */}
                    <div className="debate-stats">
                      <span className="stat-item">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        <span>{debate.views.toLocaleString()}</span>
                      </span>
                      <span className="stat-item">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <span>{debate.comments}</span>
                      </span>
                      <span className="stat-item">
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <span>{debate.likes}</span>
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-message">
                  등록된 게시글이 없습니다.
                </div>
              )}
            </div>

            {/* 더보기 버튼 */}
            <div className="debates-footer">
              <button
                className="btn-debate btn-debate-secondary"
                onClick={() => navigate("/debate")}
              >
                모든 토론 보기
              </button>
            </div>
          </div>
        </section>
        {/* ===== 4. 카테고리 섹션 + 푸터 ===== */}
        <section className="categories-section fullpage-section">
          <div className="categories-content">
            <div className="container">
              <div className="section-header">
                <h2 className="section-title">토론 카테고리</h2>
                <p className="section-subtitle">
                  관심있는 주제를 선택하고 토론에 참여하세요
                </p>
              </div>

              <div className="categories-grid" data-count={categories.length}>
                {loading && categories.length === 0 ? (
                  <div className="loading-message">카테고리 로딩 중...</div>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <div
                      key={category.id}
                      className="category-card"
                      style={{ "--category-color": category.color }}
                      onClick={() => handleCategoryClick(category.id)}
                    >
                      <div className="category-icon">{category.icon}</div>
                      <h3 className="category-name">{category.name}</h3>
                      <p className="category-count">
                        {category.debateCount.toLocaleString()}개의 토론
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="empty-message">
                    등록된 카테고리가 없습니다.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ===== 푸터 (풀페이지 wrapper 안, 별도 영역) ===== */}
        <footer className="home-footer">
          <div className="container">
            <div className="footer-content-fullpage">
              <div className="footer-section-item">
                <h4>DEBATE</h4>
                <p>건설적인 토론을 통한 성장</p>
              </div>
              <div className="footer-section-item">
                <h4>이용안내</h4>
                <a href="/about">소개</a>
                <a href="/rules">이용규칙</a>
              </div>
              <div className="footer-section-item">
                <h4>문의</h4>
                <p>contact@debate.com</p>
              </div>
            </div>
            <div className="footer-bottom-fullpage">
              <p>© 2025 Debate. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default HomePage;