/**
 * RankingPodium.jsx - 랭킹 시스템 시상 단상 컴포넌트
 * 
 * 주요 기능:
 * - 1, 2, 3위 시상 단상 표시
 * - 로그인 페이지 캐릭터(Debater) 통합
 * - 다크모드 지원 (마피아 모자, 망토, 빛나는 눈)
 * - 마우스 추적 눈동자 애니메이션
 */

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import UserAvatar from '../components/common/UserAvatar';
import './RankingPodium.css';

const RankingPodium = ({ topUsers = [], criteria = 'likes' }) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const [showConfetti, setShowConfetti] = useState(false);
  const podiumRef = useRef(null);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });

  // 팡파레 색종이 데이터 (렌더링 시마다 변경되지 않도록 상태로 관리)
  const [confettiData] = useState(() => {
    const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1'];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1
    }));
  });

  useEffect(() => {
    // 컴포넌트 마운트 시 팡파레 효과 자동 실행
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // 마우스 추적 (눈동자)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!podiumRef.current) return;

      // 화면 중앙을 기준으로 계산
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;

      const moveX = (e.clientX - centerX) / 35;
      const moveY = (e.clientY - centerY) / 35;

      setPupilPos({
        x: Math.max(-5, Math.min(5, moveX)),
        y: Math.max(-3, Math.min(3, moveY)),
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // 눈동자 스타일
  const pupilStyle = {
    transform: `translate(${pupilPos.x}px, ${pupilPos.y}px)`,
  };

  // 순위별 데이터 정리 (2위, 1위, 3위 순서로 배치)
  const podiumOrder = [
    topUsers[1] || null, // 2위 (왼쪽)
    topUsers[0] || null, // 1위 (중앙)
    topUsers[2] || null  // 3위 (오른쪽)
  ];

  const getRankClass = (index) => {
    if (index === 1) return 'first';
    if (index === 0) return 'second';
    if (index === 2) return 'third';
    return '';
  };

  const getRankNumber = (index) => {
    if (index === 1) return 1;
    if (index === 0) return 2;
    if (index === 2) return 3;
    return 0;
  };

  const getMedalEmoji = (index) => {
    if (index === 1) return '🥇';
    if (index === 0) return '🥈';
    if (index === 2) return '🥉';
    return '';
  };

  const getCriteriaLabel = (c) => {
    switch (c) {
      case 'likes': return '좋아요';
      case 'votes': return '투표 수';
      case 'comments': return '댓글 좋아요';
      default: return '점수';
    }
  };

  // 캐릭터 SVG 렌더링 함수
  const renderCharacter = (rankClass) => {
    // 1위는 오른쪽 캐릭터(Right Char) 스타일, 2/3위는 왼쪽 캐릭터(Left Char) 스타일 등
    const isFirst = rankClass === 'first';

    // 1위: 오른쪽 캐릭터 (망토가 오른쪽으로 날림)
    if (isFirst) {
      return (
        <div className="debater-char right-char">
          <svg viewBox="0 0 200 240" className="char-svg">
            {/* [다크모드 아이템] 망토 (뒤) */}
            <path
              className="mafia-cape-back"
              d="M180,160 Q210,240 160,240 L40,240 Q10,240 40,160 Z"
            />

            {/* 몸체 */}
            <path
              className="char-body"
              d="M160,60 L60,60 Q30,60 30,90 L70,160 Q80,180 110,180 L160,180 Q190,180 190,150 L190,90 Q190,60 160,60 Z"
            />

            {/* 웃는 눈 (Smiling Eyes) */}
            <g className="eye-group" transform="translate(140, 100)">
              <path
                d="M-15,0 Q0,-15 15,0"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
                className="smiling-eye"
              />
            </g>

            {/* [다크모드 아이템] 페도라 모자 */}
            <g className="mafia-hat" transform="rotate(5, 100, 50)">
              <ellipse cx="100" cy="65" rx="70" ry="20" fill="#121212" />
              <path
                d="M50,65 Q50,10 100,10 Q150,10 150,65"
                fill="#121212"
              />
              <path
                d="M52,55 Q100,65 148,55 L148,65 Q100,75 52,65 Z"
                fill="#FFC107"
              />
            </g>
          </svg>
        </div>
      );
    }

    // 2위, 3위: 왼쪽 캐릭터 (망토가 왼쪽으로 날림)
    // 3위는 좌우 반전하여 서로 바라보게 연출할 수도 있음
    return (
      <div className={`debater-char left-char ${rankClass === 'third' ? 'flipped' : ''}`}>
        <svg viewBox="0 0 200 240" className="char-svg">
          {/* [다크모드 아이템] 망토 (뒤) */}
          <path
            className="mafia-cape-back"
            d="M20,160 Q-10,240 40,240 L160,240 Q190,240 160,160 Z"
          />

          {/* 몸체 */}
          <path
            className="char-body"
            d="M40,60 L140,60 Q170,60 170,90 L130,160 Q120,180 90,180 L40,180 Q10,180 10,150 L10,90 Q10,60 40,60 Z"
          />

          {/* 웃는 눈 (Smiling Eyes) */}
          <g className="eye-group" transform="translate(60, 100)">
            <path
              d="M-15,0 Q0,-15 15,0"
              strokeWidth="5"
              strokeLinecap="round"
              fill="none"
              className="smiling-eye"
            />
          </g>

          {/* [다크모드 아이템] 페도라 모자 */}
          <g className="mafia-hat">
            <ellipse cx="100" cy="65" rx="70" ry="20" fill="#121212" />
            <path
              d="M50,65 Q50,10 100,10 Q150,10 150,65"
              fill="#121212"
            />
            <path
              d="M52,55 Q100,65 148,55 L148,65 Q100,75 52,65 Z"
              fill="#FFC107"
            />
          </g>
        </svg>
      </div>
    );
  };

  return (
    <div className={`ranking-podium-container ${isDarkMode ? 'dark-mode' : ''}`} ref={podiumRef}>
      {/* 팡파레 효과 */}
      {showConfetti && (
        <div className="confetti-container">
          {confettiData.map((confetti) => (
            <div
              key={confetti.id}
              className="confetti"
              style={{
                backgroundColor: confetti.color,
                left: `${confetti.left}%`,
                animationDelay: `${confetti.delay}s`,
                animationDuration: `${confetti.duration}s`
              }}
            />
          ))}
        </div>
      )}

      {/* 타이틀 */}
      <div className="podium-title">
        <h2>🏆 TOP 3 랭킹 🏆</h2>
        <p className="podium-subtitle">토론의 달인들을 소개합니다!</p>
      </div>

      {/* 시상 단상 */}
      <div className="podium-stage">
        {podiumOrder.map((user, index) => {
          const rankClass = getRankClass(index);
          const rankNumber = getRankNumber(index);

          return (
            <div
              key={index}
              className={`podium-item ${rankClass} ${user ? '' : 'empty'}`}
            >
              {user ? (
                <>
                  {/* 캐릭터 영역 */}
                  <div className="character-container">
                    {/* 로고 기반 캐릭터 - 펄쩍펄쩍 뛰는 애니메이션 */}
                    <div className={`debate-character-wrapper ${rankClass}-character`}>
                      {renderCharacter(rankClass)}
                    </div>

                    {/* 메달 */}
                    <div className="medal">{getMedalEmoji(index)}</div>

                    {/* 순위 배지 */}
                    <div className={`rank-badge ${rankClass}-badge`}>
                      {rankNumber}위
                    </div>
                  </div>

                  {/* 단상 (캐릭터 바로 아래 위치) */}
                  <div className={`podium-base ${rankClass}-base`}>
                    <div className="podium-rank-number">{rankNumber}</div>
                  </div>

                  {/* 사용자 정보 (단상 아래로 이동) */}
                  <div className="user-info">
                    <div
                      className="user-avatar clickable-nickname"
                      onClick={() => navigate(`/users/${user.userId}`)}
                    >
                      <UserAvatar
                        src={user.profileImage}
                        alt={user.nickname}
                        size="medium"
                      />
                    </div>
                    <h3
                      className="user-nickname clickable-nickname"
                      onClick={() => navigate(`/users/${user.userId}`)}
                    >
                      {user.nickname}
                    </h3>
                    <div className="user-stats">
                      <div className="stat-item">
                        <span className="stat-label">토론</span>
                        <span className="stat-value">{user.debateCount || 0}</span>
                      </div>
                      <div className="stat-item">
                        <span className="stat-label">{getCriteriaLabel(criteria)}</span>
                        <span className="stat-value">{user.totalLikes || 0}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="empty-character">
                    <div className="empty-icon">👤</div>
                  </div>
                  <div className={`podium-base ${rankClass}-base`}>
                    <div className="podium-rank-number">{rankNumber}</div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RankingPodium;