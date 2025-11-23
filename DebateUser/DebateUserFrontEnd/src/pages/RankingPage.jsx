import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import * as userService from "../services/userService";
import "./RankingPage.css";

function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRanking();
  }, []);

  const loadRanking = async () => {
    try {
      setLoading(true);
      setError("");

      console.log("랭킹 조회 시작...");
      const response = await userService.getUserRanking(10);
      console.log("전체 응답:", response);

      // 여러 응답 구조 처리
      let rankingData = [];
      if (response?.data?.data) {
        rankingData = response.data.data;
      } else if (response?.data) {
        rankingData = response.data;
      } else if (Array.isArray(response)) {
        rankingData = response;
      }

      console.log("파싱된 랭킹 데이터:", rankingData);
      setRanking(rankingData);
    } catch (err) {
      console.error("랭킹 조회 실패:", err);
      console.error("에러 상세:", err.response?.data);
      setError(
        err.response?.data?.message || "랭킹을 불러오는데 실패했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="ranking-page">
        <div className="container">
          <div className="loading">
            <div className="spinner"></div>
            <p>랭킹을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ranking-page">
        <div className="container">
          <div className="error">
            <p>{error}</p>
            <button onClick={loadRanking} className="retry-btn">
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ranking-page">
      <div className="container">
        <h1 className="page-title">🏆 사용자 랭킹</h1>
        <p className="page-desc">받은 좋아요가 많은 사용자 순위</p>

        {!ranking || ranking.length === 0 ? (
          <div className="empty">
            <span className="empty-icon">📊</span>
            <p>아직 랭킹 데이터가 없습니다.</p>
            <p className="empty-hint">토론을 작성하고 좋아요를 받아보세요!</p>
          </div>
        ) : (
          <div className="ranking-list">
            {ranking.map((user, index) => (
              <Link
                key={user.userId}
                to={`/users/${user.userId}`}
                className={`rank-item rank-${index + 1}`}
              >
                <div className="rank-number">
                  {index === 0 && "🥇"}
                  {index === 1 && "🥈"}
                  {index === 2 && "🥉"}
                  {index > 2 && `${index + 1}위`}
                </div>

                <div className="user-avatar">
                  {user.profileImage ? (
                    <img src={user.profileImage} alt={user.nickname} />
                  ) : (
                    <div className="avatar-text">
                      {user.nickname?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                </div>

                <div className="user-info">
                  <div className="nickname">
                    {user.nickname || "알 수 없음"}
                  </div>
                  <div className="stats">토론 {user.debateCount || 0}개</div>
                </div>

                <div className="likes">
                  <div className="likes-count">
                    {(user.totalLikes || 0).toLocaleString()}
                  </div>
                  <div className="likes-label">좋아요</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default RankingPage;
