/**
 * DebateCreatePage 컴포넌트
 *
 * 새로운 토론을 작성하는 페이지입니다.
 *
 * 주요 기능:
 * - 토론 제목 및 내용 입력
 * - 카테고리 선택
 * - 토론 기간 설정 (시작일시 ~ 종료일시)
 * - 폼 유효성 검사
 * - 토론 생성 후 상세 페이지로 이동
 */

import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { debateService } from "../services/debateService";
import { categoryService } from "../services/categoryService";
import { fileUploadService } from "../services/fileUploadService";
import ImageUploadModal from "../components/common/ImageUploadModal";
import "./DebateCreatePage.css";

/**
 * DebateCreatePage 컴포넌트
 *
 * @returns {JSX.Element} 토론 작성 페이지 컴포넌트
 */
const DebateCreatePage = () => {
  // 훅 사용
  const navigate = useNavigate(); // 페이지 네비게이션
  const quillRef = useRef(null); // React Quill ref

  // 상태 관리
  const [categories, setCategories] = useState([]); // 카테고리 목록
  const [formData, setFormData] = useState({
    title: "", // 토론 제목
    content: "", // 토론 내용
    categoryId: "", // 선택된 카테고리 ID
    startDate: "", // 토론 시작일시
    endDate: "", // 토론 종료일시
  });
  const [error, setError] = useState(""); // 에러 메시지
  const [loading, setLoading] = useState(false); // 로딩 상태
  const [isImageModalOpen, setIsImageModalOpen] = useState(false); // 이미지 업로드 모달 상태

  /**
   * 컴포넌트 마운트 시 카테고리 목록 로딩
   */
  useEffect(() => {
    fetchCategories();
  }, []);

  /**
   * 카테고리 목록 가져오기
   *
   * 서버에서 카테고리 목록을 가져와 폼의 카테고리 선택 옵션에 사용합니다.
   */
  const fetchCategories = async () => {
    try {
      const response = await categoryService.getAllCategories();
      // ApiResponse 구조에서 data 추출
      const data = response.data || response;
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("카테고리 로딩 실패:", error);
    }
  };

  /**
   * HTML 태그를 제거하고 순수 텍스트만 추출하는 함수
   *
   * @param {string} html - HTML 문자열
   * @returns {string} 순수 텍스트
   */
  const stripHtml = (html) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
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
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, "image", url, "user");
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
        finalImageUrl = `${window.location.origin}${imageUrl}`;
      }

      console.log("이미지 URL:", finalImageUrl); // 디버깅용

      // 업로드된 이미지 URL을 에디터에 삽입
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
   *
   * 토론 생성 요청을 보내고 성공 시 토론 상세 페이지로 이동합니다.
   *
   * @param {Event} e - 폼 제출 이벤트
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 카테고리 선택 검증
    if (!formData.categoryId) {
      setError("카테고리를 선택해주세요.");
      return;
    }

    // 내용 검증: 내용이 비어있지 않은지 확인
    const plainText = stripHtml(formData.content).trim();
    if (plainText.length === 0) {
      setError("내용을 입력해주세요.");
      return;
    }

    // 날짜 유효성 검사: 종료일시는 시작일시보다 이후여야 함
    if (new Date(formData.startDate) >= new Date(formData.endDate)) {
      setError("종료일시는 시작일시보다 이후여야 합니다.");
      return;
    }

    setLoading(true);

    try {
      // 토론 생성 요청
      const response = await debateService.createDebate({
        title: formData.title,
        content: formData.content,
        categoryId: parseInt(formData.categoryId),
        startDate: formData.startDate,
        endDate: formData.endDate,
      });
      // ApiResponse 구조에서 data 추출
      const debateData = response.data || response;
      // 생성된 토론의 상세 페이지로 이동
      navigate(`/debate/${debateData.id}`);
    } catch (error) {
      // 에러 메시지 표시
      setError(error.response?.data?.message || "토론 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="debate-create-page">
      <div className="container">
        <h1>✍️ 새 토론 작성</h1>
        <form onSubmit={handleSubmit} className="debate-form">
          {error && <div className="error-message">{error}</div>}
          {/* 기본 정보 섹션 */}
          <div className="form-section">
            <h2>기본 정보</h2>

            <div className="form-group">
              <label htmlFor="title" className="form-label">
                제목 <span className="required">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                required
                className="form-input"
                placeholder="토론 주제를 입력하세요"
              />
              <p className="form-hint">
                명확하고 구체적인 제목을 작성해주세요.
              </p>
            </div>

            <div className="form-group">
              <label htmlFor="categoryId" className="form-label">
                카테고리 <span className="required">*</span>
              </label>
              <select
                id="categoryId"
                value={formData.categoryId}
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
                required
                className="form-select"
              >
                <option value="">카테고리를 선택하세요</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="content" className="form-label">
                내용 <span className="required">*</span>
              </label>
              <ReactQuill
                ref={quillRef}
                theme="snow"
                value={formData.content}
                onChange={(value) =>
                  setFormData({ ...formData, content: value })
                }
                placeholder="토론 내용을 입력하세요"
                modules={quillModules}
                formats={quillFormats}
              />
              <p className="form-hint">
                건설적인 토론을 위해 배경 지식과 함께 작성해주시면 좋습니다.
              </p>
            </div>
          </div>
          // DebateCreatePage.jsx - 컴팩트한 날짜 섹션
          {/* 토론 기간 설정 섹션 - 컴팩트 버전 */}
          <div className="form-section">
            <h2>토론 기간 설정</h2>

            <div className="date-grid">
              <div className="date-card">
                <div className="date-card-title">
                  <span className="date-icon">🚀</span>
                  시작일시
                </div>
                <input
                  type="datetime-local"
                  id="startDate"
                  value={formData.startDate}
                  onChange={(e) =>
                    setFormData({ ...formData, startDate: e.target.value })
                  }
                  required
                  className="form-input"
                />
                <p className="date-card-hint">토론 시작 날짜와 시간</p>
              </div>

              <div className="date-card">
                <div className="date-card-title">
                  <span className="date-icon">🏁</span>
                  종료일시
                </div>
                <input
                  type="datetime-local"
                  id="endDate"
                  value={formData.endDate}
                  onChange={(e) =>
                    setFormData({ ...formData, endDate: e.target.value })
                  }
                  required
                  className="form-input"
                />
                <p className="date-card-hint">토론 종료 날짜와 시간</p>
              </div>
            </div>
          </div>
          {/* 제출 버튼 */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/debate")}
              className="btn btn-cancel"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`btn btn-submit ${loading ? "loading" : ""}`}
            >
              {loading ? "작성 중" : "토론 시작하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DebateCreatePage;
