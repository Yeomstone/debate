/**
 * RegisterPage - 회원가입 페이지 컴포넌트
 *
 * 사용자가 새 계정을 생성할 수 있는 페이지입니다.
 * DEBATE 브랜딩(노란색-검은색)을 적용한 디자인입니다.
 *
 * 주요 기능:
 * 1. 이메일/닉네임/비밀번호 입력 폼
 * 2. 실시간 비밀번호 강도 체크
 * 3. 비밀번호 일치 확인
 * 4. 유효성 검사 (이메일, 닉네임, 비밀번호 패턴)
 * 5. 회원가입 처리 및 에러 핸들링
 * 6. 자기소개 입력 (선택사항)
 * 7. 실제 이미지 로고 사용
 *
 * @component
 */

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Auth.css";

const RegisterPage = () => {
  // ========================================
  // 훅 초기화
  // ========================================
  const navigate = useNavigate(); // 페이지 이동을 위한 네비게이션 훅
  const { register } = useAuth(); // AuthContext에서 회원가입 함수 가져오기

  // ========================================
  // 유효성 검사 패턴 및 메시지
  // ========================================

  /**
   * 이메일 유효성 검사 정규식
   * 형식: 아이디@도메인.최상위도메인
   * 예시: user@example.com
   */
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailRuleMessage = "올바른 이메일 형식을 입력해주세요.";

  /**
   * 닉네임 유효성 검사 정규식
   * 조건: 2자 이상
   */
  const nicknamePattern = /^.{2,}$/;
  const nicknameRuleMessage = "닉네임은 2자 이상 입력해야 합니다.";

  /**
   * 비밀번호 유효성 검사 정규식
   * 조건:
   * - 8자 이상
   * - 대문자 1개 이상 (?=.*[A-Z])
   * - 소문자 1개 이상 (?=.*[a-z])
   * - 숫자 1개 이상 (?=.*\d)
   * - 특수문자 1개 이상 (?=.*[특수문자])
   */
  const passwordPattern =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}|:;'"<>,.?/]).{8,}$/;
  const passwordRuleMessage =
    "비밀번호는 대문자, 소문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.";

  // ========================================
  // 상태 관리
  // ========================================

  /**
   * 폼 데이터 상태
   * @type {Object}
   * @property {string} email - 사용자 이메일
   * @property {string} password - 사용자 비밀번호
   * @property {string} passwordConfirm - 비밀번호 확인
   * @property {string} nickname - 사용자 닉네임
   * @property {string} bio - 자기소개 (선택사항)
   */
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    bio: "",
  });

  /**
   * 에러 메시지 상태
   * @type {string}
   */
  const [error, setError] = useState("");

  /**
   * 로딩 상태 (회원가입 처리 중 여부)
   * @type {boolean}
   */
  const [loading, setLoading] = useState(false);

  /**
   * 비밀번호 강도 점수 (0-5)
   * 0: 입력 없음
   * 1: 매우 약함
   * 2: 약함
   * 3-4: 보통
   * 5: 강함
   * @type {number}
   */
  const [passwordStrength, setPasswordStrength] = useState(0);

  // ========================================
  // 유틸리티 함수
  // ========================================

  /**
   * 비밀번호 강도 체크 함수
   *
   * 점수 계산 기준:
   * - 8자 이상: +1점
   * - 대문자 포함: +1점
   * - 소문자 포함: +1점
   * - 숫자 포함: +1점
   * - 특수문자 포함: +1점
   *
   * @param {string} password - 체크할 비밀번호
   * @returns {number} 강도 점수 (0-5)
   */
  const checkPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++; // 길이 체크
    if (/[A-Z]/.test(password)) strength++; // 대문자 체크
    if (/[a-z]/.test(password)) strength++; // 소문자 체크
    if (/\d/.test(password)) strength++; // 숫자 체크
    if (/[!@#$%^&*()_+\-={}|:;'"<>,.?/]/.test(password)) strength++; // 특수문자 체크
    return strength;
  };

  /**
   * 비밀번호 강도 텍스트 반환 함수
   *
   * @returns {string} "약함", "보통", "강함" 또는 빈 문자열
   */
  const getPasswordStrengthText = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "약함";
    if (passwordStrength <= 4) return "보통";
    return "강함";
  };

  /**
   * 비밀번호 강도 CSS 클래스 반환 함수
   *
   * @returns {string} "weak", "medium", "strong" 또는 빈 문자열
   */
  const getPasswordStrengthClass = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 2) return "weak";
    if (passwordStrength <= 4) return "medium";
    return "strong";
  };

  // ========================================
  // 이벤트 핸들러
  // ========================================

  /**
   * 비밀번호 변경 핸들러
   *
   * 기능:
   * 1. 입력된 비밀번호로 formData 상태 업데이트
   * 2. 비밀번호 강도 실시간 계산 및 표시
   *
   * @param {Event} e - 입력 이벤트
   */
  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setFormData({ ...formData, password: newPassword });
    setPasswordStrength(checkPasswordStrength(newPassword));
  };

  /**
   * 회원가입 폼 제출 핸들러
   *
   * 처리 순서:
   * 1. 폼 기본 제출 동작 방지
   * 2. 이전 에러 메시지 초기화
   * 3. 이메일 형식 검증
   * 4. 닉네임 길이 검증
   * 5. 비밀번호 일치 확인
   * 6. 비밀번호 강도 검증
   * 7. 로딩 상태 활성화
   * 8. AuthContext의 register 함수 호출
   * 9. 성공 시 메인 페이지로 이동
   * 10. 실패 시 에러 메시지 표시
   *
   * @param {Event} e - 폼 제출 이벤트
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 기본 제출 동작 방지
    setError(""); // 이전 에러 메시지 초기화

    // ========================================
    // 유효성 검사
    // ========================================

    // 1. 이메일 형식 검증
    if (!emailPattern.test(formData.email)) {
      setError(emailRuleMessage);
      return;
    }

    // 2. 닉네임 길이 검증
    if (!nicknamePattern.test(formData.nickname)) {
      setError(nicknameRuleMessage);
      return;
    }

    // 3. 비밀번호 일치 확인
    if (formData.password !== formData.passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    // 4. 비밀번호 강도 검증
    if (!passwordPattern.test(formData.password)) {
      setError(passwordRuleMessage);
      return;
    }

    // ========================================
    // 회원가입 처리
    // ========================================

    setLoading(true); // 로딩 상태 활성화

    try {
      // AuthContext의 register 함수 호출 (API 요청)
      await register({
        email: formData.email,
        password: formData.password,
        nickname: formData.nickname,
        bio: formData.bio || undefined, // 빈 문자열이면 undefined로 전송
      });

      // 회원가입 성공 시 메인 페이지로 리다이렉트
      navigate("/");
    } catch (error) {
      // 에러 메시지 추출 및 표시
      setError(error.response?.data?.message || "회원가입에 실패했습니다.");
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
        <p className="auth-subtitle">토론에 참여하고 의견을 나누세요</p>
      </div>

      {/* ======================================== */}
      {/* 회원가입 폼 컨테이너 */}
      {/* ======================================== */}
      <div className="auth-container">
        {/* 폼 제목 */}
        <h2 className="form-title">회원가입</h2>

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
        {/* 회원가입 폼 */}
        {/* ======================================== */}
        <form onSubmit={handleSubmit} className="auth-form">
          {/* 이메일 입력 필드 */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              이메일 *
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className="form-input"
              placeholder="example@email.com"
            />
          </div>

          {/* 닉네임 입력 필드 */}
          <div className="form-group">
            <label htmlFor="nickname" className="form-label">
              닉네임 *
            </label>
            <input
              type="text"
              id="nickname"
              value={formData.nickname}
              onChange={(e) =>
                setFormData({ ...formData, nickname: e.target.value })
              }
              required
              className="form-input"
              placeholder="2자 이상 입력하세요"
            />
          </div>

          {/* 비밀번호 입력 필드 */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호 *
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={handlePasswordChange}
              required
              className="form-input"
              placeholder="대소문자, 숫자, 특수문자 포함 8자 이상"
            />
            {/* 비밀번호 강도 표시 (비밀번호 입력 시) */}
            {formData.password && (
              <div
                className={`password-strength ${getPasswordStrengthClass()}`}
              >
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{ width: `${(passwordStrength / 5) * 100}%` }}
                  ></div>
                </div>
                <span className="strength-text">
                  {getPasswordStrengthText()}
                </span>
              </div>
            )}
          </div>

          {/* 비밀번호 확인 입력 필드 */}
          <div className="form-group">
            <label htmlFor="passwordConfirm" className="form-label">
              비밀번호 확인 *
            </label>
            <input
              type="password"
              id="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={(e) =>
                setFormData({ ...formData, passwordConfirm: e.target.value })
              }
              required
              className="form-input"
              placeholder="비밀번호를 다시 입력하세요"
            />
            {/* 비밀번호 일치 여부 표시 (비밀번호 확인 입력 시) */}
            {formData.passwordConfirm && (
              <div
                className={`password-match ${
                  formData.password === formData.passwordConfirm
                    ? "match"
                    : "mismatch"
                }`}
              >
                {formData.password === formData.passwordConfirm ? (
                  <span>✓ 비밀번호가 일치합니다</span>
                ) : (
                  <span>✗ 비밀번호가 일치하지 않습니다</span>
                )}
              </div>
            )}
          </div>

          {/* 자기소개 입력 필드 (선택사항) */}
          <div className="form-group">
            <label htmlFor="bio" className="form-label">
              자기소개 (선택)
            </label>
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              className="form-textarea"
              placeholder="자신을 소개해주세요"
              rows="3"
            />
          </div>

          {/* ======================================== */}
          {/* 회원가입 버튼 */}
          {/* 로딩 중일 때 비활성화되고 스피너 표시 */}
          {/* ======================================== */}
          <button
            type="submit"
            className="btn-debate btn-debate-primary"
            disabled={loading}
          >
            {loading ? (
              // 로딩 중일 때: 스피너와 "가입 중..." 텍스트 표시
              <span className="loading-content">
                <span className="spinner"></span>
                <span>가입 중...</span>
              </span>
            ) : (
              // 평상시: "회원가입" 텍스트만 표시
              "회원가입"
            )}
          </button>
        </form>

        {/* ======================================== */}
        {/* 구분선 */}
        {/* ======================================== */}
        <div className="auth-divider">
          <span>이미 계정이 있으신가요?</span>
        </div>

        {/* ======================================== */}
        {/* 추가 링크 (로그인) */}
        {/* ======================================== */}
        <div className="auth-links">
          {/* 로그인 페이지로 이동하는 링크 */}
          <Link to="/auth/login" className="link-primary">
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
};

/**
 * 회원가입 페이지 컴포넌트 export
 *
 * 사용 위치:
 * - App.jsx 또는 라우터 설정 파일
 *
 * 사용 예시:
 * <Route path="/auth/register" element={<RegisterPage />} />
 */
export default RegisterPage;
