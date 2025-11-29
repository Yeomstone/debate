import React, { useState, useEffect } from "react";
import RankingPodium from "./RankingPodium";
import { getUserRanking } from "../services/userService";
import "./RankingPodium.css"; // Re-use the CSS or create a new one if needed

const RankingPage = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('all');
  const [criteria, setCriteria] = useState('likes');

  useEffect(() => {
    const fetchRanking = async () => {
      setLoading(true);
      try {
        const data = await getUserRanking(10, period, criteria);
        const users = Array.isArray(data) ? data : data.content || [];
        setTopUsers(users);
      } catch (err) {
        console.error("랭킹 데이터 로딩 실패:", err);
        setError("랭킹 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, [period, criteria]);

  const getCriteriaLabel = (c) => {
    switch(c) {
      case 'likes': return '좋아요';
      case 'votes': return '투표율';
      case 'comments': return '댓글 좋아요';
      default: return '점수';
    }
  };

  if (loading) {
    return <div className="ranking-page-loading">랭킹 불러오는 중...</div>;
  }

  if (error) {
    return <div className="ranking-page-error">{error}</div>;
  }

  return (
    <div className="ranking-page">
      <div className="ranking-filters">
        <div className="filter-group">
          <button className={`filter-btn ${period === 'daily' ? 'active' : ''}`} onClick={() => setPeriod('daily')}>일별</button>
          <button className={`filter-btn ${period === 'monthly' ? 'active' : ''}`} onClick={() => setPeriod('monthly')}>월별</button>
          <button className={`filter-btn ${period === 'yearly' ? 'active' : ''}`} onClick={() => setPeriod('yearly')}>연도별</button>
          <button className={`filter-btn ${period === 'all' ? 'active' : ''}`} onClick={() => setPeriod('all')}>전체</button>
        </div>
        <div className="filter-group">
          <button className={`filter-btn ${criteria === 'likes' ? 'active' : ''}`} onClick={() => setCriteria('likes')}>좋아요순</button>
          <button className={`filter-btn ${criteria === 'votes' ? 'active' : ''}`} onClick={() => setCriteria('votes')}>투표율순</button>
          <button className={`filter-btn ${criteria === 'comments' ? 'active' : ''}`} onClick={() => setCriteria('comments')}>댓글 좋아요순</button>
        </div>
      </div>

      <RankingPodium topUsers={topUsers} criteria={criteria} />
      
      {/* 4위부터 리스트로 보여줄 수도 있음. 일단은 Podium만 렌더링 */}
      {topUsers.length > 3 && (
        <div className="ranking-list">
          <h3>Top 4 - 10</h3>
          <ul className="ranking-list-items">
            {topUsers.slice(3).map((user, index) => (
              <li key={user.id || index} className="ranking-list-item">
                <span className="rank-number">{index + 4}</span>
                <span className="user-nickname">{user.nickname}</span>
                <span className="user-score">{getCriteriaLabel(criteria)} {user.totalLikes || 0}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default RankingPage;
