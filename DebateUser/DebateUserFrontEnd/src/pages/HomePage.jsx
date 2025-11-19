/**
 * HomePage - 메인 홈페이지 컴포넌트 (이미지 로고 사용)
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import debateLogo from "../assets/debate-onlylogo.png";
import "./HomePage.css";

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [stats, setStats] = useState({
    totalDebates: 0,
    activeUsers: 0,
    totalComments: 0,
  });

  useEffect(() => {
    setStats({
      totalDebates: 1234,
      activeUsers: 567,
      totalComments: 8901,
    });
  }, []);

  return (
    <div className="home-page">
      {/* Hero Section */}
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

          <div className="hero-buttons">
            {isAuthenticated ? (
              <>
                <button
                  className="btn-debate btn-debate-primary btn-debate-lg"
                  onClick={() => navigate("/debates/create")}
                >
                  토론 시작하기
                </button>

                <button
                  className="btn-debate btn-debate-secondary btn-debate-lg"
                  onClick={() => navigate("/debates")}
                >
                  토론 둘러보기
                </button>
              </>
            ) : (
              <>
                <button
                  className="btn-debate btn-debate-primary btn-debate-lg"
                  onClick={() => navigate("/auth/register")}
                >
                  시작하기
                </button>

                <button
                  className="btn-debate btn-debate-secondary btn-debate-lg"
                  onClick={() => navigate("/auth/login")}
                >
                  로그인
                </button>
              </>
            )}
          </div>
        </div>

        <div className="hero-decoration">
          <div className="bubble bubble-1"></div>
          <div className="bubble bubble-2"></div>
          <div className="bubble bubble-3"></div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M8 10H16M8 14H16M6 20H18C19.1046 20 20 19.1046 20 18V6C20 4.89543 19.1046 4 18 4H6C4.89543 4 4 4.89543 4 6V18C4 19.1046 4.89543 20 6 20Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {stats.totalDebates.toLocaleString()}
                </div>
                <div className="stat-label">진행 중인 토론</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {stats.activeUsers.toLocaleString()}
                </div>
                <div className="stat-label">활동 중인 사용자</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div className="stat-content">
                <div className="stat-number">
                  {stats.totalComments.toLocaleString()}
                </div>
                <div className="stat-label">작성된 의견</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">DEBATE의 특별함</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon yellow-bg">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M12 6v6l4 2"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <h3 className="feature-title">실시간 토론</h3>
              <p className="feature-description">
                실시간으로 의견을 교환하고 즉각적인 피드백을 받을 수 있습니다.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon yellow-bg">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="feature-title">다양한 관점</h3>
              <p className="feature-description">
                다양한 배경의 사람들과 의견을 나누며 새로운 시각을 얻을 수
                있습니다.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon yellow-bg">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M22 11.08V12a10 10 0 1 1-5.93-9.14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M22 4 12 14.01l-3-3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="feature-title">건전한 토론 문화</h3>
              <p className="feature-description">
                상호 존중을 바탕으로 건설적인 토론 문화를 만들어갑니다.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon yellow-bg">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <h3 className="feature-title">투표 및 평가</h3>
              <p className="feature-description">
                찬성과 반대 투표로 여론의 흐름을 확인하고 의견을 표현하세요.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="cta-section">
          <div className="container">
            <div className="cta-content">
              <h2 className="cta-title">지금 바로 토론에 참여하세요</h2>
              <p className="cta-description">
                무료로 가입하고 다양한 주제의 토론에 참여해보세요
              </p>
              <button
                className="btn-debate btn-debate-primary btn-debate-lg"
                onClick={() => navigate("/auth/register")}
              >
                무료로 시작하기
              </button>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default HomePage;
