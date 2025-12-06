/**
 * DebateCreatePage 컴포넌트 - 완전 개선 버전
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { debateService } from "../services/debateService";
import { categoryService } from "../services/categoryService";
import { fileUploadService } from "../services/fileUploadService";
import ImageUploadModal from "../components/common/ImageUploadModal";
import { registerQuillModules } from "../utils/quillConfig";
import "./DebateCreatePage.css";

const DebateCreatePage = () => {
  const navigate = useNavigate();
  const quillRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    categoryId: "",
    startDate: "",
    endDate: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const handleDateInputClick = (e) => {
    // 지원 브라우저(Chrome 등)에서 input 클릭 시 달력 피커 열기
    if (typeof e.target.showPicker === "function") {
      try {
        e.target.showPicker();
      } catch (err) {
        // 브라우저가 사용자 제스처가 아니라고 판단하는 경우 에러를 무시
        // 기본 동작(아이콘 클릭 등)에만 맡긴다.
      }
    }
  };

  useEffect(() => {
    // Quill 커스텀 모듈(이미지 리사이즈 등) 등록
    registerQuillModules();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      const data = response.data || response;
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("카테고리 로딩 실패:", error);
    }
  };

  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

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
              const href = window.prompt("링크 URL을 입력하세요:");
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
      },
    }),
    []
  );

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
        const protocol = window.location.protocol;
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

  const handleImageUrlInsert = (url) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", url, "user");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }

    const contentText = stripHtml(formData.content);
    if (!contentText.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }

    if (!formData.categoryId) {
      setError("카테고리를 선택해주세요.");
      return;
    }

    if (!formData.startDate) {
      setError("토론 시작 날짜를 선택해주세요.");
      return;
    }

    if (!formData.endDate) {
      setError("토론 종료 날짜를 선택해주세요.");
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const now = new Date();

    if (start < now) {
      setError("토론 시작 날짜는 현재 시각 이후여야 합니다.");
      return;
    }

    if (end <= start) {
      setError("토론 종료 날짜는 시작 날짜보다 이후여야 합니다.");
      return;
    }

    setLoading(true);

    try {
      const response = await debateService.createDebate({
        title: formData.title,
        content: formData.content,
        categoryId: parseInt(formData.categoryId),
        startDate: formData.startDate,
        endDate: formData.endDate,
      });

      const debateId = response.data?.id || response.id;
      navigate(`/debate/${debateId}`);
    } catch (error) {
      setError(error.response?.data?.message || "토론 작성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="debate-create-page">
      <div className="debate-create-container">
        {/* 헤더 */}
        <div className="create-header">
          <h1 className="create-title">새로운 토론 시작하기</h1>
          <p className="create-subtitle">
            건설적인 토론으로 다양한 의견을 나눠보세요
          </p>
        </div>

        {/* 메인 폼 */}
        <form onSubmit={handleSubmit} className="create-form">
          {/* 에러 메시지 */}
          {error && (
            <div className="create-error">
              <span className="error-icon">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* 제목 */}
          <div className="form-field">
            <label className="field-label">
              토론 제목 <span className="required">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="field-input"
              placeholder="제목을 입력하세요"
              maxLength={100}
              required
            />
          </div>

          {/* 카테고리 */}
          <div className="form-field">
            <label className="field-label">
              카테고리 <span className="required">*</span>
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="field-select"
              required
            >
              <option value="">카테고리를 선택하세요</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* 내용 */}
          <div className="form-field">
            <label className="field-label">
              토론 내용 <span className="required">*</span>
            </label>
            <div className="editor-wrapper">
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={formData.content}
                onChange={(value) =>
                  setFormData({ ...formData, content: value })
                }
                placeholder="토론의 배경, 쟁점, 주요 논점 등을 자세히 설명해주세요"
                modules={quillModules}
                formats={quillFormats}
              />
            </div>
            <p className="field-hint">
              참여자들이 쉽게 이해할 수 있도록 충분한 맥락과 정보를 제공해주세요
            </p>
          </div>

          {/* 날짜 */}
          <div className="date-fields">
            <div className="form-field">
              <label className="field-label">
                시작일시 <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
                onClick={handleDateInputClick}
                className="field-input"
                required
              />
            </div>

            <div className="form-field">
              <label className="field-label">
                종료일시 <span className="required">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
                onClick={handleDateInputClick}
                className="field-input"
                required
              />
            </div>
          </div>

          {/* 버튼 */}
          <div className="form-buttons">
            <button
              type="button"
              onClick={() => navigate("/debate")}
              className="btn-cancel"
              disabled={loading}
            >
              취소
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? "작성 중..." : "토론 시작하기"}
            </button>
          </div>
        </form>

        {/* 이미지 업로드 모달 */}
        <ImageUploadModal
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onUrlSubmit={handleImageUrlInsert}
          onFileSelect={handleImageFileSelect}
        />
      </div>

      {/* 로딩 오버레이 */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
};

export default DebateCreatePage;
