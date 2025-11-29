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

import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./Auth.css";
import api from "../../services/api"; // api 인스턴스 import
import defaultProfile from "../../assets/default-profile.png"; // 기본 프로필 이미지 import

const RegisterPage = () => {
  // ========================================
  // 훅 초기화
  // ========================================
  const navigate = useNavigate(); // 페이지 이동을 위한 네비게이션 훅
  const { register } = useAuth(); // AuthContext에서 회원가입 함수 가져오기4

  // [수정 1] 최대 글자 수 상수 정의
  const MAX_BIO_LENGTH = 200; // 자기소개 최대 글자 수 제한

  // ========================================
  // 유효성 검사 패턴 및 메시지
  // ========================================

  /**
   * 이메일 유효성 검사 정규식
   * 형식: 아이디@도메인.최상위도메인
   * 예시: user@example.com
   */
  // 영문/숫자 기반 이메일만 허용 (한글/특수 도메인 차단)
  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const emailRuleMessage =
    "영문 이메일 형식만 가능합니다. 예: user@example.com";

  /**
   * 닉네임 유효성 검사 정규식
   * 조건: 2자 이상
   */
  const nicknamePattern = /^[가-힣a-zA-Z0-9]{2,8}$/;
  const nicknameRuleMessage =
    "닉네임은 2~8자, 공백 없이 한글/영문/숫자만 가능합니다.";

  // 닉네임: 공백 여부, 허용 문자 체크용
  const nicknameCharPattern = /^[가-힣a-zA-Z0-9]+$/; // 한글/영문/숫자만
  const nicknameSpacePattern = /\s/; // 공백 있는지 여부

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

  // [추가] 프로필 이미지 상태
  const [profileImage, setProfileImage] = useState(null); // 업로드할 파일 객체
  const [previewUrl, setPreviewUrl] = useState(defaultProfile); // 미리보기 URL (기본값: defaultProfile)

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

  // [수정 2] 자기소개 변경 핸들러 추가 (글자 수 제한 로직 포함)
  const handleBioChange = (e) => {
    const val = e.target.value;

    // 입력된 글자 수가 최대 허용치(200자) 이하일 때만 상태 업데이트
    if (val.length <= MAX_BIO_LENGTH) {
      setFormData({ ...formData, bio: val });
    }
  };

  // [추가] 프로필 이미지 변경 핸들러
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file)); // 미리보기 URL 생성
    }
  };

  // [추가] 기본 이미지로 변경 핸들러
  const handleResetImage = () => {
    setProfileImage(null);
    setPreviewUrl(defaultProfile);
    // 파일 입력 초기화 (같은 파일 다시 선택 가능하도록)
    const fileInput = document.getElementById("profile-upload");
    if (fileInput) fileInput.value = "";
  };
  // [추가] 중복 확인 상태 (idle, loading, success, error)
  const [emailCheck, setEmailCheck] = useState({ status: "idle", message: "" });
  const [nicknameCheck, setNicknameCheck] = useState({
    status: "idle",
    message: "",
  });
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
  /**
   * 실제 API를 호출하여 중복 여부를 확인하는 함수
   */
  // 수정된 checkDuplicateAPI 함수
  const checkDuplicateAPI = async (type, value) => {
    const endpoint =
      type === "email" ? "/auth/check-email" : "/auth/check-nickname";
    const paramName = type;

    try {
      await axios.get(`${endpoint}?${paramName}=${value}`);
      return true;
    } catch (error) {
      let message = "";

      if (error.response) {
        // 서버가 응답을 줬는데 에러인 경우 (예: 409 Conflict - 중복)
        if (error.response.status === 409) {
          message =
            error.response.data?.message ||
            `이미 사용 중인 ${type === "email" ? "이메일" : "닉네임"}입니다.`;
        } else {
          message = "확인 중 오류가 발생했습니다.";
        }
      } else if (error.request) {
        // 요청은 보냈으나 응답을 못 받은 경우 (서버 꺼짐 등)
        message = "서버와 연결할 수 없습니다.";
      } else {
        message = "에러가 발생했습니다.";
      }

      throw new Error(message);
    }
  };

  // [추가] 이메일 중복 확인 (0.5초 딜레이)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!formData.email)
        return setEmailCheck({ status: "idle", message: "" });
      if (!emailPattern.test(formData.email))
        return setEmailCheck({
          status: "error",
          message: "올바른 형식이 아닙니다.",
        });

      setEmailCheck({ status: "loading", message: "확인 중..." });
      try {
        await checkDuplicateAPI("email", formData.email);
        setEmailCheck({
          status: "success",
          message: "사용 가능한 이메일입니다.",
        });
      } catch (err) {
        setEmailCheck({ status: "error", message: err.message });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [formData.email]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const raw = formData.nickname;
      const trimmed = raw.trim();

      // 1) 아무것도 안 쓴 경우
      if (!trimmed) {
        setNicknameCheck({ status: "idle", message: "" });
        return;
      }

      // 2) 공백 포함 (중간 공백 포함 전체)
      if (nicknameSpacePattern.test(raw)) {
        setNicknameCheck({
          status: "error",
          message: "닉네임에 공백은 사용할 수 없습니다.",
        });
        return;
      }

      // 3) 길이 체크 (2자 미만)
      if (trimmed.length < 2) {
        setNicknameCheck({
          status: "error",
          message: "닉네임은 2자 이상 입력해주세요.",
        });
        return;
      }

      // 4) 길이 체크 (8자 초과)
      if (trimmed.length > 8) {
        setNicknameCheck({
          status: "error",
          message: "닉네임은 8자 이내로 입력해주세요.",
        });
        return;
      }

      // 5) 허용하지 않는 문자 (특수문자 등)
      if (!nicknameCharPattern.test(trimmed)) {
        setNicknameCheck({
          status: "error",
          message: "닉네임은 한글/영문/숫자만 사용할 수 있습니다.",
        });
        return;
      }

      // 6) 여기까지 통과하면 → 서버에 중복 확인 요청
      setNicknameCheck({ status: "loading", message: "확인 중..." });

      try {
        await checkDuplicateAPI("nickname", trimmed);
        setNicknameCheck({
          status: "success",
          message: "사용 가능한 닉네임입니다.",
        });
      } catch (err) {
        setNicknameCheck({ status: "error", message: err.message });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.nickname]);

  const handleSubmit = async (e) => {
    e.preventDefault(); // 폼 기본 제출 동작 방지
    setError(""); // 이전 에러 메시지 초기화

    // [추가] 중복 확인 통과 여부 체크
    if (emailCheck.status !== "success" || nicknameCheck.status !== "success") {
      setError("이메일과 닉네임을 확인해주세요.");
      return;
    }

    // ========================================
    // 유효성 검사
    // ========================================

    // 1. 이메일 형식 검증
    if (!emailPattern.test(formData.email)) {
      setError(emailRuleMessage);
      return;
    }

    // 사용자가 입력한 닉네임 원본 (앞/뒤/중간 공백 그대로 있는 상태)
    const rawNickname = formData.nickname;

    // 앞뒤 공백만 제거한 닉네임 (중간 공백은 그대로 남음)
    // 예: "  홍 길동  " -> "홍 길동"
    const trimmedNickname = rawNickname.trim();

    if (
      // 1) 닉네임 안에 공백(스페이스, 탭, 줄바꿈 등)이 하나라도 있으면 true
      //    예: "홍 길동", "심 연 의 군주" -> 조건 만족 (에러)
      nicknameSpacePattern.test(rawNickname) ||
      // 2) 공백 제거 후 길이가 2자보다 짧으면 에러
      //    예: "홍" -> 조건 만족 (에러)
      trimmedNickname.length < 2 ||
      // 3) 공백 제거 후 길이가 8자를 넘으면 에러
      //    예: "챗지피티제미나이클로드" -> 조건 만족 (에러)
      trimmedNickname.length > 8 ||
      // 4) 허용된 문자(한글/영문/숫자)만으로 이루어지지 않은 경우 에러
      //    예: "홍길동!", "심연의_군주", "테스트★" -> 조건 만족 (에러)
      !nicknameCharPattern.test(trimmedNickname)
    ) {
      // 위 조건들 중 하나라도 걸리면, 공통 닉네임 규칙 에러 메시지 출력
      // nicknameRuleMessage 예: "닉네임은 2~8자, 공백 없이 한글/영문/숫자만 가능합니다."
      setError(nicknameRuleMessage);
      return; // 에러니까 여기서 함수 종료, 회원가입 진행 안 함
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
          <div className="validation-message error global-error">
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
          {/* [추가] 프로필 이미지 업로드 섹션 */}
          <div className="profile-upload-section">
            <div className="profile-preview">
              <img
                src={previewUrl}
                alt="Profile Preview"
                className="profile-image-preview"
              />
            </div>
            <div className="profile-actions">
              <label htmlFor="profile-upload" className="btn-upload">
                이미지 선택
              </label>
              <input
                type="file"
                id="profile-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden-input"
              />
              {profileImage && (
                <button
                  type="button"
                  onClick={handleResetImage}
                  className="btn-reset-image"
                >
                  기본 이미지로 변경
                </button>
              )}
            </div>
          </div>
          <div className="form-group">
            {/* 이메일 입력 필드 */}
            <label htmlFor="text" className="form-label">
              이메일
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
              className={`form-input ${
                emailCheck.status === "error" ? "input-error" : ""
              }`}
              placeholder="example@email.com"
            />
            {/* [추가] 메시지 표시 영역 */}
            {emailCheck.message && (
              <div className={`validation-message ${emailCheck.status}`}>
                {emailCheck.message}
              </div>
            )}
          </div>

          <div className="form-group">
            {/* 닉네임 입력 필드 */}
            <label htmlFor="text" className="form-label">
              이름
            </label>
            <input
              type="text"
              id="nickname"
              value={formData.nickname}
              onChange={(e) =>
                setFormData({ ...formData, nickname: e.target.value })
              }
              required
              className={`form-input ${
                nicknameCheck.status === "error" ? "input-error" : ""
              }`}
              placeholder="닉네임은 2~8자, 공백 없이 한글/영문/숫자만 가능합니다."
            />
            {/* [추가] 메시지 표시 영역 */}
            {nicknameCheck.message && (
              <div className={`validation-message ${nicknameCheck.status}`}>
                {nicknameCheck.message}
              </div>
            )}
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

            {/* [수정 3] textarea 속성 변경 및 글자 수 카운터 추가 */}
            <textarea
              id="bio"
              value={formData.bio}
              onChange={handleBioChange} // 위에서 만든 핸들러 연결
              className="form-textarea"
              // placeholder에 최대 글자 수 안내
              placeholder={`자신을 소개해주세요 (최대 ${MAX_BIO_LENGTH}자)`}
              rows="3"
            />

            {/* 글자 수 카운터 표시 (CSS 클래스는 Auth.css에 이미 있음) */}
            <div className="textarea-footer">
              <span className="character-count">
                {formData.bio.length} / {MAX_BIO_LENGTH}자
              </span>
            </div>
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
