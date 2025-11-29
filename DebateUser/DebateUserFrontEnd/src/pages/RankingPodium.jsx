/**
 * RankingPodium.jsx - 랭킹 시스템 시상 단상 컴포넌트
 * 
 * 주요 기능:
 * - 1, 2, 3위 시상 단상 표시
 * - 로고 컨셉 기반 캐릭터 애니메이션
 * - 펄쩍펄쩍 뛰는 효과
 * - 팡파레 애니메이션
 * - 황금/은/동 색상 구분
 */

import React, { useState, useEffect } from 'react';
import './RankingPodium.css';

const RankingPodium = ({ topUsers = [], criteria = 'likes' }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    // 컴포넌트 마운트 시 팡파레 효과 자동 실행
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

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
    switch(c) {
      case 'likes': return '좋아요';
      case 'votes': return '투표 수';
      case 'comments': return '댓글 좋아요';
      default: return '점수';
    }
  };

  // 팡파레 색종이 생성
  const generateConfetti = () => {
    const colors = ['#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4', '#45B7D1'];
    return Array.from({ length: 50 }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: Math.random() * 100,
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 1
    }));
  };

  return (
    <div className="ranking-podium-container">
      {/* 팡파레 효과 */}
      {showConfetti && (
        <div className="confetti-container">
          {generateConfetti().map((confetti) => (
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
                    <div className={`debate-character ${rankClass}-character`}>
                      {/* 왼쪽 말풍선 (찬성 측면) */}
                      <div className="character-bubble left-bubble">
                        <div className="bubble-eye"></div>
                      </div>
                      
                      {/* 가운데 연결부 */}
                      <div className="character-connector"></div>
                      
                      {/* 오른쪽 말풍선 (반대 측면) */}
                      <div className="character-bubble right-bubble">
                        <div className="bubble-eye"></div>
                      </div>
                    </div>

                    {/* 메달 */}
                    <div className="medal">{getMedalEmoji(index)}</div>

                    {/* 순위 배지 */}
                    <div className={`rank-badge ${rankClass}-badge`}>
                      {rankNumber}위
                    </div>
                  </div>

                  {/* 사용자 정보 */}
                  <div className="user-info">
                    <div className="user-avatar">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.nickname} />
                      ) : (
                        <div className="avatar-placeholder">
                          {user.nickname?.[0]?.toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                    <h3 className="user-nickname">{user.nickname}</h3>
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

                  {/* 단상 */}
                  <div className={`podium-base ${rankClass}-base`}>
                    <div className="podium-rank-number">{rankNumber}</div>
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

      {/* 스파클 효과 */}
      <div className="sparkles">
        <span className="sparkle">✨</span>
        <span className="sparkle">✨</span>
        <span className="sparkle">✨</span>
        <span className="sparkle">✨</span>
      </div>
    </div>
  );
};

export default RankingPodium;