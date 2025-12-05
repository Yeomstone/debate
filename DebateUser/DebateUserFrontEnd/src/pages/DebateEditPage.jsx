/**
 * DebateEditPage 컴포넌트
 *
 * 토론을 수정하는 페이지입니다.
 *
 * 주요 기능:
 * - 기존 토론 정보 로딩
 * - 토론 제목 및 내용 수정
 * - 카테고리 변경
 * - 토론 기간 수정 (시작일시 ~ 종료일시)
 * - 폼 유효성 검사
 * - 토론 수정 후 상세 페이지로 이동
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { debateService } from "../services/debateService";
import { categoryService } from "../services/categoryService";
import { fileUploadService } from "../services/fileUploadService";
import ImageUploadModal from "../components/common/ImageUploadModal";
import { format } from "date-fns";
import "./DebateCreatePage.css";

/**
 * DebateEditPage 컴포넌트
 *
 * @returns {JSX.Element} 토론 수정 페이지 컴포넌트
 */
const DebateEditPage = () => {
  // 훅 사용
  const { id } = useParams(); // URL 파라미터에서 토론 ID 가져오기
  const navigate = useNavigate(); // 페이지 네비게이션
  const quillRef = useRef(null); // React Quill ref

  // 상태 관리
  const [categories, setCategories] = useState([]); // 카테고리 목록
  const [loading, setLoading] = useState(true); // 초기 로딩 상태
  const [formData, setFormData] = useState({
    title: "", // 토론 제목
    content: "", // 토론 내용
    categoryId: "", // 선택된 카테고리 ID
    startDate: "", // 토론 시작일시
    endDate: "", // 토론 종료일시
  });
  const [error, setError] = useState(""); // 에러 메시지
  const [submitting, setSubmitting] = useState(false); // 제출 중 상태
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // 이미지 업로드 모달 상태

  const handleDateInputClick = (e) => {
    // 지원 브라우저(Chrome 등)에서 input 클릭 시 달력 피커 열기
    if (typeof e.target.showPicker === "function") {
      try {
        e.target.showPicker();
      } catch (err) {
        // 사용자 제스처로 인식되지 않는 경우 등 에러는 무시하고 기본 동작에 맡긴다.
      }
    }
  };

  /**
   * 컴포넌트 마운트 시 카테고리 목록 및 토론 정보 로딩
   */
  useEffect(() => {
    fetchCategories();
    fetchDebate();
  }, [id]);

  /**
   * 카테고리 목록 가져오기
   */
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      const data = response.data || response;
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("카테고리 로딩 실패:", error);
    }
  };

  /**
   * 토론 정보 가져오기
   */
  const fetchDebate = async () => {
    try {
      setLoading(true);
      const response = await debateService.getDebateById(id);
      const debate = response.data || response;

      // 날짜를 datetime-local 형식으로 변환
      const startDate = debate.startDate
        ? format(new Date(debate.startDate), "yyyy-MM-dd'T'HH:mm")
        : "";
      const endDate = debate.endDate
        ? format(new Date(debate.endDate), "yyyy-MM-dd'T'HH:mm")
        : "";

      setFormData({
        title: debate.title || "",
        content: debate.content || "",
        categoryId: debate.categoryId || debate.category?.id || "",
        startDate,
        endDate,
      });
    } catch (error) {
      console.error("토론 정보 로딩 실패:", error);
      setError("토론 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * HTML 태그를 제거하고 순수 텍스트만 추출하는 함수
   */
  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  /**
   * React Quill 에디터 모듈 설정
   */
  const quillModules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ["bold", "italic", "underline", "strike"],
          [{ list: "ordered" }, { list: "bullet" }],
          [{ align: [] }],
          [{ color: [] }, { background: [] }],
          ["link", "image", "blockquote", "code-block"],
          ["clean"],
        ],
        handlers: {
          image: function () {
            setIsImageModalOpen(true);
          },
          link: function (value) {
            const quill = quillRef.current?.getEditor() || this.quill;
            if (value) {
              const href = prompt("링크 URL을 입력하세요:");
              if (href) {
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
      "align",
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
   */
  const handleImageUrlSubmit = (url) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", url, "user");
    }
  };

  /**
   * 이미지 파일 선택 처리
   */
  const handleImageFileSelect = async (file) => {
    try {
      const imageUrl = await fileUploadService.uploadImage(file);
      let finalImageUrl = imageUrl;
      if (
        imageUrl &&
        !imageUrl.startsWith("http://") &&
        !imageUrl.startsWith("https://") &&
        !imageUrl.startsWith("data:")
      ) {
        // 현재 페이지의 프로토콜과 일치시키기 (HTTPS 페이지에서는 HTTPS 사용)
        const origin = window.location.origin;
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
      const quill = quillRef.current?.getEditor();
      if (quill) {
        const range = quill.getSelection(true);
        quill.insertEmbed(range.index, "image", finalImageUrl, "user");
      }
    } catch (error) {
      console.error("이미지 업로드 실패:", error);
      alert(error.response?.data?.message || "이미지 업로드에 실패했습니다.");
    }
  };

  /**
   * 폼 제출 처리 함수
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 카테고리 선택 검증
    if (!formData.categoryId) {
      setError("카테고리를 선택해주세요.");
      return;
    }

    // 내용 검증
    const plainText = stripHtml(formData.content).trim();
    if (plainText.length === 0) {
      setError("내용을 입력해주세요.");
      return;
    }

    // 날짜 유효성 검사
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError("종료일시는 시작일시보다 이후여야 합니다.");
      return;
    }

    setSubmitting(true);

    try {
      // 토론 수정 요청
      await debateService.updateDebate(id, {
        title: formData.title,
        content: formData.content,
        categoryId: parseInt(formData.categoryId),
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
      // 수정된 토론의 상세 페이지로 이동
      navigate(`/debate/${id}`);
    } catch (error) {
      setError(error.response?.data?.message || "토론 수정에 실패했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="debate-create-page">
        <div className="container">
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <p>토론 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="debate-create-page">
      <div className="container">
        <h1>토론 수정</h1>
        <form onSubmit={handleSubmit} className="debate-form">
          {error && <div className="error-message">{error}</div>}
          <div className="form-group">
            <label htmlFor="title">제목</label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
              className="form-input"
              placeholder="토론 제목을 입력하세요"
            />
          </div>
          <div className="form-group">
            <label htmlFor="categoryId">카테고리</label>
            <select
              id="categoryId"
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              required
              className="form-select"
            >
              <option value="">카테고리 선택</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="content">내용</label>
            <ReactQuill
              ref={quillRef}
              theme="snow"
              value={formData.content}
              onChange={(value) => setFormData({ ...formData, content: value })}
              placeholder="토론 내용을 입력하세요"
              modules={quillModules}
              formats={quillFormats}
            />
            <p className="form-hint">
              건설적인 토론을 위해 배경 지식과 함께 작성해주시면 좋습니다.
            </p>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">시작일시</label>
              <input
                type="datetime-local"
                id="startDate"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                onClick={handleDateInputClick}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="endDate">종료일시</label>
              <input
                type="datetime-local"
                id="endDate"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                onClick={handleDateInputClick}
                required
                className="form-input"
              />
            </div>
          </div>
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline"
            >
              취소
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? "수정 중..." : "수정하기"}
            </button>
          </div>
        </form>
      </div>

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

export default DebateEditPage;
