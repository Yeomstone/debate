/**
 * 토론 관리 페이지
 *
 * 토론 목록 조회, 검색/필터링, 수정/삭제, 숨김 처리, 상태 변경 기능을 제공합니다.
 */

import { useEffect, useState, useRef, useMemo } from "react";
import { adminDebateService } from "../services/adminDebateService";
import { fileUploadService } from "../services/fileUploadService";
import { adminCommentService } from "../services/adminCommentService";
import { format } from "date-fns";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import ImageUploadModal from "../components/common/ImageUploadModal";
import UserAvatar from "../components/common/UserAvatar";
import "./DebatePage.css";
// 유저 사이트 스타일을 위한 추가 import
import "../styles/debate-detail-modal.css";

const DebatePage = () => {
  const [debates, setDebates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [hiddenFilter, setHiddenFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedDebate, setSelectedDebate] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    title: "",
    content: "",
    startDate: "",
    endDate: "",
  });
  const quillRef = useRef(null); // React Quill ref
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // 이미지 업로드 모달 상태
  
  // 댓글 관련 상태
  const [comments, setComments] = useState([]);
  const [commentPage, setCommentPage] = useState(0);
  const [commentTotalPages, setCommentTotalPages] = useState(0);
  const [commentSort, setCommentSort] = useState("latest"); // latest, oldest, replies

  useEffect(() => {
    loadDebates();
  }, [currentPage, statusFilter, hiddenFilter]);

  const loadDebates = async () => {
    try {
      setLoading(true);
      const response = await adminDebateService.getDebates({
        keyword: searchKeyword || undefined,
        status: statusFilter || undefined,
        isHidden: hiddenFilter || undefined,
        page: currentPage,
        size: 20,
      });

      // API 인터셉터가 ApiResponse를 반환하므로 response.data가 실제 데이터
      const data = response.data || response;
      if (data && data.content) {
        setDebates(data.content);
        setTotalPages(data.totalPages || 0);
        setTotalElements(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setDebates(data);
        setTotalPages(1);
        setTotalElements(data.length);
      } else {
        console.error("예상하지 못한 응답 형식:", data);
        alert("토론 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("토론 목록 로딩 실패:", error);
      alert("토론 목록을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(0);
    loadDebates();
  };

  const handleViewDetail = async (id) => {
    try {
      const response = await adminDebateService.getDebateDetail(id);
      const data = response.data?.data || response.data || response;
      
      // 이미지 URL 변환 (HTTPS 페이지에서 HTTP 이미지 로드 방지)
      if (data && data.content) {
        data.content = convertImageUrls(data.content);
      }
      
      setSelectedDebate(data);
      setShowDetailModal(true);
      
      // 댓글 상태 초기화
      setCommentPage(0);
      setCommentSort("latest");
      
      // 댓글 로드
      await fetchComments(id);
    } catch (error) {
      console.error("토론 상세 조회 실패:", error);
      alert("토론 정보를 불러오는데 실패했습니다.");
    }
  };

  // 댓글 가져오기 (관리자 API 사용 - 숨김 댓글 포함)
  const fetchComments = async (debateId) => {
    if (!debateId) return;
    
    try {
      let sortParam = "createdAt,desc"; // 기본: 최신순
      if (commentSort === "oldest") sortParam = "createdAt,asc";
      else if (commentSort === "replies") sortParam = "replyCount,desc";

      const response = await adminCommentService.getCommentsByDebate(
        debateId,
        commentPage,
        7,
        sortParam
      );
      
      // ApiResponse 구조: { success, message, data: { content, totalPages, ... } }
      const data = response.data || response;
      
      if (data && data.content) {
        setComments(data.content || []);
        setCommentTotalPages(data.totalPages || 0);
      } else if (Array.isArray(data)) {
        // 배열로 직접 반환된 경우
        setComments(data);
        setCommentTotalPages(1);
      } else {
        console.warn("예상하지 못한 댓글 응답 형식:", data);
        setComments([]);
        setCommentTotalPages(0);
      }
    } catch (error) {
      console.error("댓글 로딩 실패:", error);
      // 댓글 로딩 실패해도 모달은 표시
      setComments([]);
      setCommentTotalPages(0);
    }
  };

  // 댓글 숨김 처리
  const handleToggleCommentHidden = async (commentId) => {
    try {
      await adminCommentService.toggleCommentHidden(commentId);
      alert("댓글 숨김 상태가 변경되었습니다.");
      // 댓글 다시 로드
      if (selectedDebate?.id) {
        await fetchComments(selectedDebate.id);
      }
    } catch (error) {
      console.error("댓글 숨김 처리 실패:", error);
      alert("댓글 숨김 처리에 실패했습니다.");
    }
  };

  // 댓글 삭제
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("정말 이 댓글을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.")) {
      return;
    }

    try {
      await adminCommentService.deleteComment(commentId);
      alert("댓글이 삭제되었습니다.");
      // 댓글 다시 로드
      if (selectedDebate?.id) {
        await fetchComments(selectedDebate.id);
      }
    } catch (error) {
      console.error("댓글 삭제 실패:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  // 댓글 렌더링
  const renderComments = () => {
    if (comments.length === 0) {
      return <div className="debate-detail-no-comments">댓글이 없습니다.</div>;
    }

    return comments.map((comment) => {
      const replies = comment.replies || [];
      const isModified =
        !comment.isDeleted && comment.updatedAt && comment.updatedAt !== comment.createdAt;

      return (
        <div 
          key={comment.id} 
          className={`debate-detail-comment-block ${comment.isHidden ? 'hidden' : ''}`}
        >
          {/* 부모 댓글 */}
          <div className="debate-detail-comment-row debate-detail-comment-root">
            <div className="debate-detail-comment-avatar">
              {comment.profileImage ? (
                <img src={comment.profileImage} alt={comment.nickname} />
              ) : (
                <span>{comment.nickname?.[0] || "?"}</span>
              )}
            </div>
            <div className="debate-detail-comment-main">
              <div className="debate-detail-comment-header">
                <span className="debate-detail-comment-name">{comment.nickname}</span>
                <span className="debate-detail-comment-time">
                  {format(new Date(comment.createdAt), "MM.dd HH:mm")}
                  {isModified && " (수정됨)"}
                  {comment.isHidden && (
                    <span className="debate-detail-comment-hidden-badge"> [숨김]</span>
                  )}
                </span>
              </div>
              <p
                className={`debate-detail-comment-text ${comment.isDeleted ? "deleted" : ""}`}
                style={
                  comment.isDeleted
                    ? { color: "#999", fontStyle: "italic" }
                    : {}
                }
              >
                {comment.content}
              </p>
              {!comment.isDeleted && (
                <div className="debate-detail-comment-actions">
                  <span className="debate-detail-comment-like">
                    {comment.liked ? "❤️" : "🤍"} {comment.likeCount || 0}
                  </span>
                  {/* 관리자 액션 버튼 */}
                  <div className="debate-detail-comment-admin-actions">
                    <button
                      className="debate-detail-comment-action-btn"
                      onClick={() => handleToggleCommentHidden(comment.id)}
                      title={comment.isHidden ? "공개하기" : "숨기기"}
                    >
                      {comment.isHidden ? "👁️ 공개" : "🙈 숨김"}
                    </button>
                    <button
                      className="debate-detail-comment-action-btn debate-detail-comment-delete-btn"
                      onClick={() => handleDeleteComment(comment.id)}
                      title="삭제하기"
                    >
                      🗑️ 삭제
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 자식 댓글 (답글) */}
          {replies.length > 0 && (
            <div className="debate-detail-replies-container">
              {replies.map((reply) => {
                const isReplyModified =
                  !reply.isDeleted && reply.updatedAt && reply.updatedAt !== reply.createdAt;

                return (
                  <div 
                    key={reply.id} 
                    className={`debate-detail-comment-row debate-detail-comment-reply ${reply.isHidden ? 'hidden' : ''}`}
                  >
                    <div className="debate-detail-reply-line"></div>
                    <div className="debate-detail-comment-avatar debate-detail-comment-avatar-small">
                      {reply.profileImage ? (
                        <img src={reply.profileImage} alt={reply.nickname} />
                      ) : (
                        <span>{reply.nickname?.[0] || "?"}</span>
                      )}
                    </div>
                    <div className="debate-detail-comment-main">
                      <div className="debate-detail-comment-header">
                        <span className="debate-detail-comment-name">{reply.nickname}</span>
                        <span className="debate-detail-comment-time">
                          {format(new Date(reply.createdAt), "MM.dd HH:mm")}
                          {isReplyModified && " (수정됨)"}
                          {reply.isHidden && (
                            <span className="debate-detail-comment-hidden-badge"> [숨김]</span>
                          )}
                        </span>
                      </div>
                      <p
                        className={`debate-detail-comment-text ${reply.isDeleted ? "deleted" : ""}`}
                        style={
                          reply.isDeleted
                            ? { color: "#999", fontStyle: "italic" }
                            : {}
                        }
                      >
                        {reply.content}
                      </p>
                      {!reply.isDeleted && (
                        <div className="debate-detail-comment-actions">
                          <span className="debate-detail-comment-like">
                            {reply.liked ? "❤️" : "🤍"} {reply.likeCount || 0}
                          </span>
                          {/* 관리자 액션 버튼 */}
                          <div className="debate-detail-comment-admin-actions">
                            <button
                              className="debate-detail-comment-action-btn"
                              onClick={() => handleToggleCommentHidden(reply.id)}
                              title={reply.isHidden ? "공개하기" : "숨기기"}
                            >
                              {reply.isHidden ? "👁️ 공개" : "🙈 숨김"}
                            </button>
                            <button
                              className="debate-detail-comment-action-btn debate-detail-comment-delete-btn"
                              onClick={() => handleDeleteComment(reply.id)}
                              title="삭제하기"
                            >
                              🗑️ 삭제
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  /**
   * HTML 콘텐츠의 이미지 URL을 현재 프로토콜에 맞게 변환
   * HTTPS 페이지에서 HTTP 이미지를 로드하는 Mixed Content 문제 방지
   * IP 주소를 도메인으로 변환하여 SSL 인증서 경고 방지
   */
  const convertImageUrls = (htmlContent) => {
    if (!htmlContent) return htmlContent;

    const currentOrigin = window.location.origin;
    const currentHost = window.location.host;

    // 현재 페이지가 HTTPS인 경우
    if (window.location.protocol === "https:") {
      // IP 주소를 도메인으로 변환 (13.209.254.24 -> debate.me.kr)
      htmlContent = htmlContent.replace(
        /src="https?:\/\/13\.209\.254\.24(\/[^"]+)"/g,
        `src="https://debate.me.kr$1"`
      );

      // HTTP 이미지 URL을 HTTPS로 변환
      htmlContent = htmlContent.replace(
        /src="http:\/\/([^"]+)"/g,
        'src="https://$1"'
      );

      // 상대 경로 이미지를 절대 경로로 변환 (프로토콜 포함)
      htmlContent = htmlContent.replace(
        /src="(\/[^"]+)"/g,
        `src="${currentOrigin}$1"`
      );
    } else {
      // HTTP 페이지에서도 IP 주소를 도메인으로 변환
      htmlContent = htmlContent.replace(
        /src="https?:\/\/13\.209\.254\.24(\/[^"]+)"/g,
        `src="http://debate.me.kr$1"`
      );

      // 상대 경로를 절대 경로로 변환
      htmlContent = htmlContent.replace(
        /src="(\/[^"]+)"/g,
        `src="${currentOrigin}$1"`
      );
    }

    return htmlContent;
  };

  const handleEdit = (debate) => {
    setSelectedDebate(debate);
    setEditFormData({
      title: debate.title || "",
      content: debate.content || "",
      startDate: debate.startDate
        ? format(new Date(debate.startDate), "yyyy-MM-dd'T'HH:mm")
        : "",
      endDate: debate.endDate
        ? format(new Date(debate.endDate), "yyyy-MM-dd'T'HH:mm")
        : "",
    });
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedDebate) return;

    try {
      await adminDebateService.updateDebate(selectedDebate.id, editFormData);
      alert("토론이 수정되었습니다.");
      loadDebates();
      setShowEditModal(false);
    } catch (error) {
      console.error("토론 수정 실패:", error);
      alert("토론 수정에 실패했습니다.");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    if (
      !window.confirm(
        `토론 상태를 ${getStatusLabel(newStatus)}로 변경하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      await adminDebateService.updateDebateStatus(id, newStatus);
      alert("토론 상태가 변경되었습니다.");
      loadDebates();
    } catch (error) {
      console.error("토론 상태 변경 실패:", error);
      alert("토론 상태 변경에 실패했습니다.");
    }
  };

  const handleToggleHidden = async (id) => {
    try {
      await adminDebateService.toggleDebateHidden(id);
      alert("숨김 상태가 변경되었습니다.");
      loadDebates();
    } catch (error) {
      console.error("숨김 상태 변경 실패:", error);
      alert("숨김 상태 변경에 실패했습니다.");
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "정말 이 토론을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
      )
    ) {
      return;
    }

    try {
      await adminDebateService.deleteDebate(id);
      alert("토론이 삭제되었습니다.");
      loadDebates();
    } catch (error) {
      console.error("토론 삭제 실패:", error);
      alert("토론 삭제에 실패했습니다.");
    }
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      SCHEDULED: "예정",
      ACTIVE: "진행중",
      ENDED: "종료",
    };
    return statusMap[status] || status;
  };

  const getStatusBadgeClass = (status) => {
    const classMap = {
      SCHEDULED: "status-scheduled",
      ACTIVE: "status-active",
      ENDED: "status-ended",
    };
    return classMap[status] || "";
  };

  /**
   * React Quill 에디터 모듈 설정
   * 이미지 업로드 핸들러 포함
   * useMemo로 메모이제이션하여 불필요한 재렌더링 방지
   */
  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }], // 텍스트 정렬 (좌측, 중앙, 우측, 양쪽 정렬)
          [{ color: [] }, { background: [] }],
          ["link", "image", "blockquote", "code-block"],
          ["clean"],
        ],
        handlers: {
          /**
           * 이미지 업로드 핸들러
           * 모달을 열어 이미지 URL 입력 또는 파일 업로드 지원
           */
          image: function () {
            // 모달 열기
            setIsImageModalOpen(true);
          },
          /**
           * 링크 핸들러 개선
           * 링크 추가/수정 시 URL 입력
           */
          link: function (value) {
            const quill = quillRef.current?.getEditor() || this.quill;
            if (value) {
              const href = prompt("링크 URL을 입력하세요:");
              if (href) {
                // URL 형식 검증
                let url = href;
                if (
                  !href.startsWith("http://") &&
                  !href.startsWith("https://")
                ) {
                  url = "https://" + href;
                }
                const range = quill.getSelection(true);
                if (range) {
                  quill.formatText(
                    range.index,
                    range.length,
                    "link",
                    url,
                    "user"
                  );
                }
              }
            } else {
              quill.format("link", false);
            }
          },
        },
      },
      // 이미지 리사이즈 모듈 설정
      imageResize: {
        parchment: Quill.import("parchment"),
        modules: ["Resize", "DisplaySize", "Toolbar"],
        handleStyles: {
          backgroundColor: "black",
          border: "none",
          color: "white",
        },
        displayStyles: {
          backgroundColor: "black",
          border: "none",
          color: "white",
        },
        toolbarStyles: {
          backgroundColor: "black",
          border: "none",
          color: "white",
        },
      },
    }),
    []
  );

  /**
   * React Quill 에디터 포맷 설정
   * useMemo로 메모이제이션하여 불필요한 재렌더링 방지
   */
  const quillFormats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "list",
      "bullet",
      "align", // 텍스트 정렬
      "color",
      "background",
      "link",
      "image",
      "blockquote",
      "code-block",
    ],
    []
  );

  /**
   * 이미지 URL 제출 처리
   * 모달에서 URL을 입력받아 에디터에 삽입
   */
  const handleImageUrlSubmit = (url) => {
    // HTTP URL을 HTTPS로 변환 (Mixed Content 방지)
    let finalUrl = url;
    if (
      url &&
      url.startsWith("http://") &&
      window.location.protocol === "https:"
    ) {
      finalUrl = url.replace("http://", "https://");
    }

    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", finalUrl, "user");
    }
  };

  /**
   * 이미지 파일 선택 처리
   * 모달에서 파일을 선택받아 업로드 후 에디터에 삽입
   */
  const handleImageFileSelect = async (file) => {
    try {
      // 백엔드에 이미지 업로드
      const imageUrl = await fileUploadService.uploadImage(file);

      // 이미지 URL이 상대 경로인 경우 절대 경로로 변환
      // React Quill은 에디터 내부에서 이미지를 로드할 때 현재 origin을 사용하므로
      // 상대 경로가 작동하지 않을 수 있습니다.
      let finalImageUrl = imageUrl;
      if (
        imageUrl &&
        !imageUrl.startsWith("http://") &&
        !imageUrl.startsWith("https://") &&
        !imageUrl.startsWith("data:")
      ) {
        // 상대 경로인 경우 현재 origin과 결합
        // IP 주소를 도메인으로 변환하여 SSL 인증서 경고 방지
        let origin = window.location.origin;
        if (origin.includes("13.209.254.24")) {
          origin = origin.replace("13.209.254.24", "debate.me.kr");
        }
        finalImageUrl = `${origin}${imageUrl}`;

        // HTTP로 시작하는 경우 HTTPS로 변경 (Mixed Content 방지)
        if (
          finalImageUrl.startsWith("http://") &&
          window.location.protocol === "https:"
        ) {
          finalImageUrl = finalImageUrl.replace("http://", "https://");
        }
      } else if (
        imageUrl &&
        imageUrl.startsWith("http://") &&
        window.location.protocol === "https:"
      ) {
        // HTTP URL을 HTTPS로 변환 (Mixed Content 방지)
        finalImageUrl = imageUrl.replace("http://", "https://");
      }

      // IP 주소를 도메인으로 변환 (SSL 인증서 경고 방지)
      if (finalImageUrl && finalImageUrl.includes("13.209.254.24")) {
        finalImageUrl = finalImageUrl.replace("13.209.254.24", "debate.me.kr");
        // HTTPS로 변환
        if (finalImageUrl.startsWith("http://")) {
          finalImageUrl = finalImageUrl.replace("http://", "https://");
        }
      }

      // 업로드된 이미지 URL을 에디터에 삽입
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", finalImageUrl, "user");
      }
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert("이미지 업로드에 실패했습니다.");
    }
  };

  return (
    <div className="debate-page">
      {/* 검색 및 필터 */}
      <div className="page-header">
        <h1>토론 관리</h1>
        <div className="search-filter-bar">
          <input
            type="text"
            className="search-input"
            placeholder="제목 또는 내용으로 검색..."
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <select
            className="filter-select"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(0);
            }}
          >
            <option value="">전체 상태</option>
            <option value="SCHEDULED">예정</option>
            <option value="ACTIVE">진행중</option>
            <option value="ENDED">종료</option>
          </select>
          <select
            className="filter-select"
            value={hiddenFilter}
            onChange={(e) => {
              setHiddenFilter(e.target.value);
              setCurrentPage(0);
            }}
          >
            <option value="">전체</option>
            <option value="false">공개</option>
            <option value="true">숨김</option>
          </select>
          <button className="btn btn-primary" onClick={handleSearch}>
            검색
          </button>
        </div>
      </div>

      {/* 토론 목록 */}
      <div className="content-card">
        {loading ? (
          <div className="admin-loading">로딩 중...</div>
        ) : (
          <>
            <div className="table-info">
              <span>총 {totalElements}개</span>
            </div>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>제목</th>
                  <th>작성자</th>
                  <th>상태</th>
                  <th>시작일시</th>
                  <th>종료일시</th>
                  <th>조회수</th>
                  <th>작업</th>
                </tr>
              </thead>
              <tbody>
                {debates.length > 0 ? (
                  debates.map((debate) => (
                    <tr
                      key={debate.id}
                      className={debate.isHidden ? "hidden-row" : ""}
                    >
                      <td>{debate.id}</td>
                      <td>
                        <div className="title-cell">
                          {debate.isHidden && (
                            <span className="hidden-badge">숨김</span>
                          )}
                          {debate.title}
                        </div>
                      </td>
                      <td>
                        <div className="author-cell">
                          <UserAvatar
                            src={debate.user?.profileImage}
                            alt={debate.user?.nickname || debate.userId || "작성자"}
                            size="small"
                          />
                          <span>{debate.user?.nickname || debate.userId || "-"}</span>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${getStatusBadgeClass(
                            debate.status
                          )}`}
                        >
                          {getStatusLabel(debate.status)}
                        </span>
                      </td>
                      <td>
                        {debate.startDate
                          ? format(
                              new Date(debate.startDate),
                              "yyyy-MM-dd HH:mm"
                            )
                          : "-"}
                      </td>
                      <td>
                        {debate.endDate
                          ? format(new Date(debate.endDate), "yyyy-MM-dd HH:mm")
                          : "-"}
                      </td>
                      <td>{debate.viewCount || 0}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleViewDetail(debate.id)}
                          >
                            상세
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleEdit(debate)}
                          >
                            수정
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleToggleHidden(debate.id)}
                          >
                            {debate.isHidden ? "공개" : "숨김"}
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => handleDelete(debate.id)}
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="8"
                      style={{ textAlign: "center", padding: "2rem" }}
                    >
                      토론이 없습니다
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* 페이징 */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(0, prev - 1))
                  }
                  disabled={currentPage === 0}
                >
                  이전
                </button>
                <span className="page-info">
                  {currentPage + 1} / {totalPages}
                </span>
                <button
                  className="btn btn-secondary"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                  }
                  disabled={currentPage >= totalPages - 1}
                >
                  다음
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* 토론 상세 모달 - 유저 사이트 스타일 */}
      {showDetailModal && selectedDebate && (
        <div
          className="debate-detail-modal-overlay"
          onClick={() => {
            setShowDetailModal(false);
            setComments([]);
            setCommentPage(0);
            setCommentSort("latest");
          }}
        >
          <div
            className="debate-detail-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="debate-detail-modal-close"
              onClick={() => {
                setShowDetailModal(false);
                setComments([]);
                setCommentPage(0);
                setCommentSort("latest");
              }}
            >
              ×
            </button>
            <div className="debate-detail-modal-body">
              <div className="debate-detail-animated-bg"></div>
              <div className="debate-detail-container">
                <article className="debate-detail-article">
                  <div className="debate-detail-article-top-bar">
                    <div className="debate-detail-top-left">
                      <span className="debate-detail-badge debate-detail-category-badge">
                        {selectedDebate.categoryName || "카테고리"}
                      </span>
                      <span
                        className={`debate-detail-badge debate-detail-status-badge ${selectedDebate.status?.toLowerCase()}`}
                      >
                        {selectedDebate.status === "ACTIVE"
                          ? "진행중"
                          : selectedDebate.status === "ENDED"
                            ? "종료됨"
                            : "예정"}
                      </span>
                      {selectedDebate.isHidden && (
                        <span className="debate-detail-badge" style={{ backgroundColor: "var(--warning-color)", color: "white" }}>
                          숨김
                        </span>
                      )}
                    </div>
                  </div>

                  <h1 className="debate-detail-article-title">{selectedDebate.title}</h1>

                  <div className="debate-detail-article-meta">
                    <div className="debate-detail-meta-left">
                      <UserAvatar
                        src={selectedDebate.user?.profileImage}
                        alt={selectedDebate.user?.nickname || selectedDebate.userId || "작성자"}
                        size="small"
                      />
                      <span className="debate-detail-author-name">
                        {selectedDebate.user?.nickname ||
                          selectedDebate.userId ||
                          "작성자"}
                      </span>
                      <span className="debate-detail-separator">·</span>
                      <span className="date">
                        {selectedDebate.createdAt
                          ? format(new Date(selectedDebate.createdAt), "yyyy.MM.dd")
                          : "-"}
                      </span>
                    </div>
                    <div className="debate-detail-meta-right">
                      <span>조회 {selectedDebate.viewCount?.toLocaleString() || 0}</span>
                      <span>댓글 {selectedDebate.commentCount?.toLocaleString() || 0}</span>
                    </div>
                  </div>

                  <div
                    className="debate-detail-article-content ql-editor"
                    dangerouslySetInnerHTML={{ __html: selectedDebate.content }}
                  />

                  <div className="debate-detail-article-footer">
                    <button
                      className="debate-detail-list-btn"
                      onClick={() => {
                        setShowDetailModal(false);
                        setComments([]);
                        setCommentPage(0);
                        setCommentSort("latest");
                      }}
                    >
                      닫기
                    </button>
                  </div>

                  {/* 관리자 액션 버튼 */}
                  <div className="debate-detail-admin-actions">
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowDetailModal(false);
                        handleEdit(selectedDebate);
                      }}
                    >
                      수정
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        if (window.confirm("숨김 상태를 변경하시겠습니까?")) {
                          handleToggleHidden(selectedDebate.id);
                          setShowDetailModal(false);
                        }
                      }}
                    >
                      {selectedDebate.isHidden ? "공개" : "숨김"}
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => {
                        if (window.confirm("정말 삭제하시겠습니까?")) {
                          handleDelete(selectedDebate.id);
                          setShowDetailModal(false);
                        }
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </article>

                {/* 댓글 섹션 */}
                <section className="debate-detail-comment-section">
                  <div className="debate-detail-comment-header-row">
                    <h3 className="debate-detail-section-header">
                      댓글 <span className="debate-detail-count">{selectedDebate.commentCount || 0}</span>
                    </h3>

                    {/* 정렬 탭 */}
                    <div className="debate-detail-sort-tabs">
                      <button
                        className={commentSort === "latest" ? "active" : ""}
                        onClick={async () => {
                          setCommentSort("latest");
                          setCommentPage(0);
                          await fetchComments(selectedDebate.id);
                        }}
                      >
                        최신순
                      </button>
                      <button
                        className={commentSort === "oldest" ? "active" : ""}
                        onClick={async () => {
                          setCommentSort("oldest");
                          setCommentPage(0);
                          await fetchComments(selectedDebate.id);
                        }}
                      >
                        오래된순
                      </button>
                      <button
                        className={commentSort === "replies" ? "active" : ""}
                        onClick={async () => {
                          setCommentSort("replies");
                          setCommentPage(0);
                          await fetchComments(selectedDebate.id);
                        }}
                      >
                        답글순
                      </button>
                    </div>
                  </div>

                  <div className="debate-detail-comment-list">{renderComments()}</div>

                  {/* 페이지네이션 */}
                  {commentTotalPages > 1 && (
                    <div className="debate-detail-pagination">
                      <button
                        disabled={commentPage === 0}
                        onClick={async () => {
                          const newPage = Math.max(0, commentPage - 1);
                          setCommentPage(newPage);
                          await fetchComments(selectedDebate.id);
                        }}
                      >
                        &lt;
                      </button>
                      {[...Array(commentTotalPages)].map((_, i) => (
                        <button
                          key={i}
                          className={commentPage === i ? "active" : ""}
                          onClick={async () => {
                            setCommentPage(i);
                            await fetchComments(selectedDebate.id);
                          }}
                        >
                          {i + 1}
                        </button>
                      ))}
                      <button
                        disabled={commentPage === commentTotalPages - 1}
                        onClick={async () => {
                          const newPage = Math.min(commentTotalPages - 1, commentPage + 1);
                          setCommentPage(newPage);
                          await fetchComments(selectedDebate.id);
                        }}
                      >
                        &gt;
                      </button>
                    </div>
                  )}
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 토론 수정 모달 */}
      {showEditModal && selectedDebate && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div
            className="modal-content modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>토론 수정</h2>
              <button
                className="modal-close"
                onClick={() => setShowEditModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>제목:</label>
                <input
                  type="text"
                  className="form-input"
                  value={editFormData.title}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, title: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>내용:</label>
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={editFormData.content}
                  onChange={(value) =>
                    setEditFormData({ ...editFormData, content: value })
                  }
                  placeholder="토론 내용을 입력하세요"
                  modules={quillModules}
                  formats={quillFormats}
                />
              </div>
              <div className="form-group">
                <label>시작일시:</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={editFormData.startDate}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      startDate: e.target.value,
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>종료일시:</label>
                <input
                  type="datetime-local"
                  className="form-input"
                  value={editFormData.endDate}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      endDate: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-secondary"
                onClick={() => setShowEditModal(false)}
              >
                취소
              </button>
              <button className="btn btn-primary" onClick={handleUpdate}>
                저장
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 이미지 업로드 모달 */}
      <ImageUploadModal
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onUrlSubmit={handleImageUrlSubmit}
        onFileSelect={handleImageFileSelect}
      />
    </div>
  );
};

export default DebatePage;
