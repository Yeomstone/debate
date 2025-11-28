/**
 * DebateDetailPage 컴포넌트
 *
 * 토론 상세 페이지입니다.
 *
 * 주요 기능:
 * - 토론 상세 정보 표시 (리브랜딩 적용)
 * - 권한별 액션 버튼 (작성자: 더보기 메뉴 / 타인: 신고하기)
 * - 댓글 목록 및 작성
 * - 찬성/반대 의견 작성 및 통계 표시
 * - 좋아요 기능
 */

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { debateService } from "../services/debateService";
import { commentService } from "../services/commentService";
import { opinionService } from "../services/opinionService";
import { likeService } from "../services/likeService";
import { reportService } from "../services/reportService"; // 신고 서비스 추가
import { format } from "date-fns";
import "./DebateDetailPage.css";

const DebateDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [debate, setDebate] = useState(null);
  const [comments, setComments] = useState([]);
  const [opinions, setOpinions] = useState([]);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 입력 상태
  const [commentContent, setCommentContent] = useState("");
  const [opinionContent, setOpinionContent] = useState("");

  // UI 상태
  const [isMenuOpen, setIsMenuOpen] = useState(false); // 더보기 메뉴 상태
  const menuRef = useRef(null); // 메뉴 외부 클릭 감지용

  // 초기 데이터 로딩
  useEffect(() => {
    setError(null);
    fetchData();
  }, [id]);

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [debateResponse, commentsResponse, opinionsResponse] =
        await Promise.all([
          debateService.getDebateById(id),
          commentService.getCommentsByDebate(id),
          opinionService.getOpinionsByDebate(id),
        ]);

      setDebate(debateResponse.data || debateResponse);
      setComments((commentsResponse.data || commentsResponse)?.content || []);
      setOpinions(opinionsResponse.data || opinionsResponse || []);

      if (isAuthenticated) {
        try {
          const liked = await likeService.isLiked(id);
          setIsLiked(liked.data || liked);
        } catch (likeError) {
          console.warn("좋아요 확인 실패:", likeError);
        }
      }
    } catch (error) {
      console.error("데이터 로딩 실패:", error);
      setError(
        error.response?.data?.message ||
          "토론을 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 좋아요 토글
  const handleLike = async () => {
    if (!isAuthenticated) {
      if (window.confirm("로그인이 필요한 기능입니다. 로그인하시겠습니까?")) {
        navigate("/auth/login");
      }
      return;
    }
    try {
      await likeService.toggleLike(id);
      setIsLiked(!isLiked);
      fetchData(); // 데이터 갱신
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
    }
  };

  // 삭제 핸들러
  const handleDelete = async () => {
    if (!window.confirm("정말 이 토론을 삭제하시겠습니까? 복구할 수 없습니다."))
      return;
    try {
      await debateService.deleteDebate(id);
      navigate("/debate");
    } catch (error) {
      alert(error.response?.data?.message || "삭제에 실패했습니다.");
    }
  };

  // 신고 핸들러
  const handleReport = async () => {
    if (!isAuthenticated) {
      if (window.confirm("로그인이 필요한 기능입니다. 로그인하시겠습니까?")) {
        navigate("/auth/login");
      }
      return;
    }

    const reason = window.prompt("신고 사유를 입력해주세요:");
    if (reason === null) return; // 취소
    if (!reason.trim()) {
      alert("신고 사유를 입력해야 합니다.");
      return;
    }

    try {
      await reportService.createReport({
        targetType: "DEBATE",
        targetId: parseInt(id),
        reason: reason,
        description: `토론 게시글 신고: ${debate.title}`,
      });
      alert("신고가 접수되었습니다. 관리자 검토 후 처리됩니다.");
    } catch (error) {
      alert(error.response?.data?.message || "신고 처리에 실패했습니다.");
    }
  };

  // 댓글 작성
  const handleCreateComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      if (window.confirm("로그인이 필요한 기능입니다. 로그인하시겠습니까?")) {
        navigate("/auth/login");
      }
      return;
    }
    if (!commentContent.trim()) return;

    try {
      await commentService.createComment({
        debateId: parseInt(id),
        content: commentContent,
      });
      setCommentContent("");
      fetchData();
    } catch (error) {
      alert(
        "댓글 작성 실패: " + (error.response?.data?.message || error.message)
      );
    }
  };

  // 의견(투표) 작성
  const handleCreateOpinion = async (side) => {
    if (!isAuthenticated) {
      if (window.confirm("로그인이 필요한 기능입니다. 로그인하시겠습니까?")) {
        navigate("/auth/login");
      }
      return;
    }

    try {
      await opinionService.createOpinion({
        debateId: parseInt(id),
        side,
        content: opinionContent || null,
      });
      setOpinionContent("");
      fetchData();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "이미 입장을 선택했거나 오류가 발생했습니다."
      );
    }
  };

  if (loading)
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  if (error || !debate) {
    return (
      <div className="container error-container">
        <h2>토론을 찾을 수 없습니다</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/debate")} className="btn btn-primary">
          목록으로
        </button>
      </div>
    );
  }

  // 권한 체크 및 상태 계산
  const isOwner = user && debate && String(user.id) === String(debate.userId);
  const canVote = debate.status === "ACTIVE";

  // 투표율 계산
  const forCount = opinions.filter((o) => o.side === "FOR").length;
  const againstCount = opinions.filter((o) => o.side === "AGAINST").length;
  const totalCount = forCount + againstCount;
  const forPercent =
    totalCount > 0 ? Math.round((forCount / totalCount) * 100) : 0;
  const againstPercent =
    totalCount > 0 ? Math.round((againstCount / totalCount) * 100) : 0;

  return (
    <div className="debate-detail-page">
      <div className="container">
        {/* === 1. 헤더 섹션 === */}
        <header className="detail-header-card">
          <div className="header-top-row">
            <div className="badges">
              <span className="badge category-badge">
                {debate.categoryName}
              </span>
              <span
                className={`badge status-badge ${debate.status?.toLowerCase()}`}
              >
                {debate.status === "ACTIVE"
                  ? "진행중"
                  : debate.status === "ENDED"
                  ? "종료됨"
                  : "예정"}
              </span>
            </div>

            {/* 액션 버튼 그룹 (수정/삭제 or 신고) */}
            <div className="header-actions" ref={menuRef}>
              {isOwner ? (
                <div className="more-menu-wrapper">
                  <button
                    className="icon-btn more-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="더보기"
                  >
                    ⋮
                  </button>
                  {isMenuOpen && (
                    <div className="dropdown-menu">
                      <button
                        onClick={() => navigate(`/debate/${id}/edit`)}
                        className="dropdown-item edit"
                      >
                        ✏️ 수정하기
                      </button>
                      <button
                        onClick={handleDelete}
                        className="dropdown-item delete"
                      >
                        🗑️ 삭제하기
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={handleReport}
                  className="btn-report"
                  aria-label="신고하기"
                >
                  🚨 신고
                </button>
              )}
            </div>
          </div>

          <h1 className="detail-title">{debate.title}</h1>

          <div className="detail-meta-row">
            <div className="author-info">
              <div className="author-avatar-wrapper">
                {/* 프로필 이미지가 있다면 여기에 img 태그 사용 가능 */}
                <div className="default-avatar">
                  {debate.nickname?.charAt(0)}
                </div>
              </div>
              <div className="author-text">
                <span className="author-name">{debate.nickname}</span>
                <span className="created-at">
                  {format(new Date(debate.createdAt), "yyyy.MM.dd HH:mm")}
                </span>
              </div>
            </div>

            <div className="stats-info">
              <span className="stat-pill">
                👁️ {debate.viewCount.toLocaleString()}
              </span>
              <span className="stat-pill">
                💬 {debate.commentCount.toLocaleString()}
              </span>
              <span className="stat-pill liked">
                👍 {debate.likeCount.toLocaleString()}
              </span>
            </div>
          </div>
        </header>

        {/* === 2. 본문 섹션 === */}
        <section className="detail-content-card">
          <div
            className="content-body ql-editor" // Quill 스타일 적용을 위해 ql-editor 클래스 추가
            dangerouslySetInnerHTML={{ __html: debate.content }}
          />

          <div className="content-footer">
            <button
              className={`btn-like ${isLiked ? "active" : ""}`}
              onClick={handleLike}
            >
              <span className="like-icon">👍</span>
              <span>좋아요 {isLiked ? "(취소)" : ""}</span>
            </button>
          </div>
        </section>

        {/* === 3. 투표 섹션 (진행중일 때만) === */}
        {debate.status === "ACTIVE" && (
          <section className="vote-section-card">
            <h2 className="section-title">📊 당신의 선택은?</h2>

            <div className="vote-container">
              {/* 찬성 */}
              <div className="vote-box vote-for">
                <h3>찬성 (FOR)</h3>
                <div className="vote-progress-wrapper">
                  <div
                    className="vote-progress-bar"
                    style={{ height: `${forPercent}%` }}
                  ></div>
                  <span className="vote-percent-text">{forPercent}%</span>
                </div>
                <p className="vote-count-text">{forCount}명 참여</p>
                {canVote && (
                  <button
                    className="btn-vote btn-vote-for"
                    onClick={() => handleCreateOpinion("FOR")}
                  >
                    찬성하기
                  </button>
                )}
              </div>

              {/* VS 구분선 */}
              <div className="vote-vs">VS</div>

              {/* 반대 */}
              <div className="vote-box vote-against">
                <h3>반대 (AGAINST)</h3>
                <div className="vote-progress-wrapper">
                  <div
                    className="vote-progress-bar"
                    style={{ height: `${againstPercent}%` }}
                  ></div>
                  <span className="vote-percent-text">{againstPercent}%</span>
                </div>
                <p className="vote-count-text">{againstCount}명 참여</p>
                {canVote && (
                  <button
                    className="btn-vote btn-vote-against"
                    onClick={() => handleCreateOpinion("AGAINST")}
                  >
                    반대하기
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* === 4. 댓글 섹션 === */}
        <section className="comments-section-card">
          <h2 className="section-title">💬 댓글 ({comments.length})</h2>

          {/* 댓글 작성 폼 */}
          <form className="comment-form" onSubmit={handleCreateComment}>
            <textarea
              className="comment-input"
              placeholder={
                isAuthenticated
                  ? "건전한 토론을 위해 매너를 지켜주세요."
                  : "로그인이 필요합니다."
              }
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              disabled={!isAuthenticated}
            />
            <div className="comment-form-footer">
              <button
                type="submit"
                className="btn-submit-comment"
                disabled={!isAuthenticated || !commentContent.trim()}
              >
                등록
              </button>
            </div>
          </form>

          {/* 댓글 목록 */}
          <div className="comments-list">
            {comments.length > 0 ? (
              comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-avatar">
                    {comment.nickname?.charAt(0)}
                  </div>
                  <div className="comment-body">
                    <div className="comment-meta">
                      <span className="comment-author">{comment.nickname}</span>
                      <span className="comment-date">
                        {format(
                          new Date(comment.createdAt),
                          "yyyy.MM.dd HH:mm"
                        )}
                      </span>
                    </div>
                    <p className="comment-text">{comment.content}</p>
                  </div>
                  {/* 본인 댓글 삭제 버튼 등 추가 가능 */}
                </div>
              ))
            ) : (
              <p className="no-comments">첫 번째 댓글을 남겨보세요!</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DebateDetailPage;
