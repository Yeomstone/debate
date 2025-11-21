/**
 * HomePage - 메인 홈페이지 컴포넌트 (수정버전)
 *
 * 수정사항:
 * 1. HERO 섹션: 버튼 제거, 검색 박스 추가
 * 2. Stats 섹션 제거 → 카테고리 박스로 교체 (Grid 형태, DB 연동)
 * 3. 최근 게시글 + 핫 게시글을 하나의 섹션으로 통합 (DB 연동)
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import debateLogo from "../assets/debate-onlylogo.png";
import "./HomePage.css";

// API 서비스 import (실제 프로젝트에서 사용)
// import { getCategories } from "../services/categoryService";
// import { getRecentDebates, getHotDebates } from "../services/debateService";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // 검색어 상태
  const [searchQuery, setSearchQuery] = useState("");

  // 카테고리 목록 상태
  const [categories, setCategories] = useState([]);

  // 최근 게시글 상태
  const [recentDebates, setRecentDebates] = useState([]);

  // 핫 게시글 상태
  const [hotDebates, setHotDebates] = useState([]);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadCategories();
    loadRecentDebates();
    loadHotDebates();
  }, []);

  /**
   * 카테고리 목록 로드 (DB 연동)
   */
  const loadCategories = async () => {
    try {
      // TODO: 실제 API 호출로 교체
      // const response = await getCategories();
      // setCategories(response.data);

      // 임시 더미 데이터
      setCategories([
        { id: 1, name: "정치", icon: "🏛️", debateCount: 234, color: "#FF6B6B" },
        { id: 2, name: "경제", icon: "💰", debateCount: 189, color: "#4ECDC4" },
        { id: 3, name: "사회", icon: "👥", debateCount: 156, color: "#45B7D1" },
        { id: 4, name: "문화", icon: "🎭", debateCount: 142, color: "#F7DC6F" },
        {
          id: 5,
          name: "과학기술",
          icon: "🔬",
          debateCount: 198,
          color: "#9B59B6",
        },
        { id: 6, name: "환경", icon: "🌱", debateCount: 167, color: "#27AE60" },
        { id: 7, name: "교육", icon: "📚", debateCount: 134, color: "#E67E22" },
        {
          id: 8,
          name: "스포츠",
          icon: "⚽",
          debateCount: 125,
          color: "#3498DB",
        },
      ]);
    } catch (error) {
      console.error("카테고리 로드 실패:", error);
    }
  };

  /**
   * 최근 게시글 로드 (DB 연동)
   */
  const loadRecentDebates = async () => {
    try {
      // TODO: 실제 API 호출로 교체
      // const response = await getRecentDebates({ limit: 5 });
      // setRecentDebates(response.data);

      // 임시 더미 데이터
      setRecentDebates([
        {
          id: 1,
          title: "AI가 인간의 일자리를 대체할 것인가?",
          category: "과학기술",
          author: "user123",
          views: 1234,
          comments: 56,
          likes: 234,
          createdAt: "2025-01-20",
          status: "active",
        },
        {
          id: 2,
          title: "기본소득 도입의 타당성",
          category: "경제",
          author: "debater456",
          views: 987,
          comments: 42,
          likes: 189,
          createdAt: "2025-01-20",
          status: "active",
        },
        {
          id: 3,
          title: "원격 근무의 미래는?",
          category: "사회",
          author: "worker789",
          views: 856,
          comments: 38,
          likes: 156,
          createdAt: "2025-01-19",
          status: "active",
        },
        {
          id: 4,
          title: "대학 등록금 무상화 찬반",
          category: "교육",
          author: "student321",
          views: 745,
          comments: 31,
          likes: 142,
          createdAt: "2025-01-19",
          status: "active",
        },
        {
          id: 5,
          title: "채식주의가 환경 보호에 효과적인가?",
          category: "환경",
          author: "green999",
          views: 689,
          comments: 27,
          likes: 128,
          createdAt: "2025-01-18",
          status: "active",
        },
      ]);
    } catch (error) {
      console.error("최근 게시글 로드 실패:", error);
    }
  };

  /**
   * 핫 게시글 로드 (DB 연동)
   */
  const loadHotDebates = async () => {
    try {
      // TODO: 실제 API 호출로 교체
      // const response = await getHotDebates({ limit: 5 });
      // setHotDebates(response.data);

      // 임시 더미 데이터 (조회수/좋아요 기준 정렬)
      setHotDebates([
        {
          id: 6,
          title: "전기차 vs 수소차, 미래의 주류는?",
          category: "환경",
          author: "eco_lover",
          views: 3456,
          comments: 145,
          likes: 567,
          createdAt: "2025-01-15",
          status: "active",
        },
        {
          id: 7,
          title: "4일 근무제 도입 찬반",
          category: "사회",
          author: "worklife",
          views: 2987,
          comments: 123,
          likes: 489,
          createdAt: "2025-01-14",
          status: "active",
        },
        {
          id: 8,
          title: "반려동물 등록제 강화 필요성",
          category: "사회",
          author: "pet_guardian",
          views: 2654,
          comments: 98,
          likes: 423,
          createdAt: "2025-01-13",
          status: "active",
        },
        {
          id: 9,
          title: "청년 정책, 무엇이 우선인가?",
          category: "정치",
          author: "youth_voice",
          views: 2345,
          comments: 87,
          likes: 378,
          createdAt: "2025-01-12",
          status: "active",
        },
        {
          id: 10,
          title: "K-POP의 글로벌 영향력",
          category: "문화",
          author: "kpop_fan",
          views: 2123,
          comments: 76,
          likes: 345,
          createdAt: "2025-01-11",
          status: "active",
        },
      ]);
    } catch (error) {
      console.error("핫 게시글 로드 실패:", error);
    }
  };

  /**
   * 검색 처리
   */
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  /**
   * 카테고리 클릭 처리
   */
  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}`);
  };

  /**
   * 게시글 클릭 처리
   */
  const handleDebateClick = (debateId) => {
    navigate(`/debates/${debateId}`);
  };

  return (
    <div className="home-page">
      {/* ===== Hero Section ===== */}
      <section className="hero-section">
        <div className="hero-content">
          {/* 로고 이미지 */}
          <div className="hero-logo">
            <img src={debateLogo} alt="DEBATE Logo" className="logo-image" />
          </div>

          <h1 className="hero-title">DEBATE</h1>

          <p className="hero-subtitle">
            다양한 주제로 토론하고, 의견을 나누며, 새로운 관점을 발견하세요
          </p>

          {/* 검색 박스 (버튼 대신 추가) */}
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

      {/* ===== 카테고리 섹션 (기존 Stats 자리) ===== */}
      <section className="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">카테고리별 토론</h2>
            <p className="section-subtitle">
              관심 있는 주제의 카테고리를 선택해보세요
            </p>
          </div>

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
        </div>
      </section>

      {/* ===== 게시글 섹션 (최근 + 핫 좌우 분할) ===== */}
      <section className="debates-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">토론 둘러보기</h2>
          </div>

          {/* 좌우 분할 레이아웃 */}
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
                {recentDebates.map((debate) => (
                  <div
                    key={debate.id}
                    className="debate-card"
                    onClick={() => handleDebateClick(debate.id)}
                  >
                    <div className="debate-card-header">
                      <span className="debate-category">{debate.category}</span>
                      <span className={`debate-status status-${debate.status}`}>
                        {debate.status === "active" ? "진행중" : "종료"}
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
                ))}
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
                {hotDebates.map((debate) => (
                  <div
                    key={debate.id}
                    className="debate-card"
                    onClick={() => handleDebateClick(debate.id)}
                  >
                    <div className="debate-card-header">
                      <span className="debate-category">{debate.category}</span>
                      <span className={`debate-status status-${debate.status}`}>
                        {debate.status === "active" ? "진행중" : "종료"}
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
                ))}
              </div>
            </div>
          </div>

          {/* 더보기 버튼 */}
          <div className="debates-footer">
            <button
              className="btn-debate btn-debate-secondary btn-debate-lg"
              onClick={() => navigate("/debates")}
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
                onClick={() => navigate("/debates/create")}
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
