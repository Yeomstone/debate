/**
 * LoginPage - 로그인 페이지 컴포넌트
 *
 * 사용자가 이메일과 비밀번호를 입력하여 로그인할 수 있는 페이지입니다.
 * DEBATE 브랜딩(노란색-검은색)을 적용한 디자인입니다.
 *
 * 주요 기능:
 * 1. 이메일/비밀번호 입력 폼
 * 2. 로그인 처리 및 에러 핸들링
 * 3. 로딩 상태 표시
 * 4. 회원가입/비밀번호 찾기 링크
 * 5. 실제 이미지 로고 사용
 *
 * @component
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

const LoginPage = () => {
  // ========================================
  // 훅 초기화
  // ========================================
  const navigate = useNavigate(); // 페이지 이동을 위한 네비게이션 훅
  const { login } = useAuth(); // AuthContext에서 로그인 함수 가져오기

  // ========================================
  // 상태 관리
  // ========================================

  /**
   * 폼 데이터 상태
   * @type {Object}
   * @property {string} email - 사용자 이메일
   * @property {string} password - 사용자 비밀번호
   */
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  /**
   * 에러 메시지 상태
   * @type {string}
   */
  const [error, setError] = useState("");

  /**
   * 로딩 상태 (로그인 처리 중 여부)
   * @type {boolean}
   */
  const [loading, setLoading] = useState(false);

  // ========================================
  // 이벤트 핸들러
  // ========================================

  /**
   * 로그인 폼 제출 핸들러
   *
   * 처리 순서:
   * 1. 폼 기본 제출 동작 방지
   * 2. 이전 에러 메시지 초기화
   * 3. 로딩 상태 활성화
   * 4. AuthContext의 login 함수 호출
   * 5. 성공 시 메인 페이지로 이동
   * 6. 실패 시 에러 메시지 표시
   *
   * @param {Event} e - 폼 제출 이벤트
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 기본 제출 동작 방지 (페이지 리로드 방지)
    setError(""); // 이전 에러 메시지 초기화
    setLoading(true); // 로딩 상태 활성화 (버튼 비활성화 및 스피너 표시)

    try {
      // AuthContext의 login 함수 호출 (API 요청)
      await login(formData.email, formData.password);

      // 로그인 성공 시 메인 페이지로 리다이렉트
      navigate("/");
    } catch (error) {
      // 에러 메시지 추출 (우선순위: API 응답 > 에러 메시지 > 기본 메시지)
      const errorMessage =
        error.response?.data?.message || // 백엔드 API 에러 메시지
        error.message || // JavaScript 에러 메시지
        "로그인에 실패했습니다."; // 기본 에러 메시지

      setError(errorMessage); // 에러 메시지 상태 업데이트
      console.error("로그인 에러:", error); // 콘솔에 에러 로그 출력
    } finally {
      // 성공/실패 여부와 관계없이 로딩 상태 비활성화
      setLoading(false);
    }
  };

  // ========================================
  // 렌더링
  // ========================================

  return (
    <div className="auth-page">
      {/* ======================================== */}
      {/* 로고 섹션 - 브랜드 아이덴티티 표시 */}
      {/* ======================================== */}
      <div className="auth-logo-section">
        {/* DEBATE 로고 이미지 */}
        <div className="debate-logo">
          {/* 
            로고 이미지 파일 경로:
            - 실제 경로: src/assets/debate-logo.png
            - Vite가 자동으로 처리하여 최적화된 URL로 변환
          */}
          <img
            src="/src/assets/debate-onlylogo.png"
            alt="DEBATE Logo"
            className="logo-image"
          />
        </div>

        {/* 브랜드 타이틀 */}
        <h1 className="auth-title">DEBATE</h1>

        {/* 부제목 */}
        <p className="auth-subtitle">다양한 의견이 만나는 토론의 장</p>
      </div>

      {/* ======================================== */}
      {/* 로그인 폼 컨테이너 */}
      {/* ======================================== */}
      <div className="auth-container">
        {/* 폼 제목 */}
        <h2 className="form-title">로그인</h2>

        {/* 에러 메시지 표시 영역 (에러가 있을 때만 표시) */}
        {error && (
          <div className="error-message">
            {/* 에러 아이콘 (경고 표시) */}
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle
                cx="10"
                cy="10"
                r="9"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M10 6V11"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="10" cy="14" r="1" fill="currentColor" />
            </svg>
            {/* 에러 메시지 텍스트 */}
            {error}
          </div>
        )}

        {/* ======================================== */}
        {/* 로그인 폼 */}
        {/* ======================================== */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* 이메일 입력 필드 */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                // 이메일 입력 시 formData 상태 업데이트
                setFormData({ ...formData, email: e.target.value })
              }
              required // HTML5 필수 입력 검증
              className="form-input"
              placeholder="example@email.com"
            />
          </div>

          {/* 비밀번호 입력 필드 */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) =>
                // 비밀번호 입력 시 formData 상태 업데이트
                setFormData({ ...formData, password: e.target.value })
              }
              required // HTML5 필수 입력 검증
              className="form-input"
              placeholder="비밀번호를 입력하세요"
            />
          </div>

          {/* ======================================== */}
          {/* 로그인 버튼 */}
          {/* 로딩 중일 때 비활성화되고 스피너 표시 */}
          {/* ======================================== */}
          <button
            type="submit"
            className="btn-debate btn-debate-primary"
            disabled={loading}
          >
            {loading ? (
              // 로딩 중일 때: 스피너와 "로그인 중..." 텍스트 표시
              <span className="loading-content">
                <span className="spinner"></span>
                <span>로그인 중...</span>
              </span>
            ) : (
              // 평상시: "로그인" 텍스트만 표시
              "로그인"
            )}
          </button>
        </form>

        {/* ======================================== */}
        {/* 구분선 */}
        {/* ======================================== */}
        <div className="auth-divider">
          <span>또는</span>
        </div>

        {/* ======================================== */}
        {/* 추가 링크 (회원가입, 비밀번호 찾기) */}
        {/* ======================================== */}
        <div className="auth-links">
          {/* 회원가입 페이지로 이동하는 링크 */}
          <Link to="/auth/register" className="link-primary">
            회원가입하기
          </Link>

          {/* 시각적 구분자 */}
          <span className="link-separator">•</span>

          {/* 비밀번호 찾기 페이지로 이동하는 링크 */}
          <Link to="/auth/forgot-password" className="link-secondary">
            비밀번호 찾기
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * 로그인 페이지 컴포넌트 export
 *
 * 사용 위치:
 * - App.jsx 또는 라우터 설정 파일
 *
 * 사용 예시:
 * <Route path="/auth/login" element={<LoginPage />} />
 */
export default LoginPage;
