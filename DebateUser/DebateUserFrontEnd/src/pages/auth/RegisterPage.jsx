/**
 * RegisterPage - 회원가입 페이지 컴포넌트
 *
 * 사용자가 새 계정을 생성할 수 있는 페이지입니다.
 * DEBATE 브랜딩(노란색-검은색)을 적용한 디자인입니다.
 *
 * 주요 기능:
 * 1. 프로필 이미지 업로드 (폼 최상단)
 * 2. 이메일/닉네임/비밀번호 입력 폼
 * 3. 실시간 비밀번호 강도 체크
 * 4. 비밀번호 일치 확인
 * 5. 유효성 검사 (이메일, 닉네임, 비밀번호 패턴)
 * 6. 회원가입 처리 및 에러 핸들링
 * 7. 자기소개 입력 (선택사항)
 *
 * @component
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import "./Auth.css";
import defaultProfile from "../../assets/default-profile.png";

const RegisterPage = () => {
  // ========================================
  // 훅 초기화
  // ========================================
  const navigate = useNavigate();
  const { register } = useAuth();
  const fileInputRef = useRef(null); // 파일 입력 참조

  // ========================================
  // 상태 관리
  // ========================================

  // 폼 데이터 상태
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    nickname: "",
    bio: "",
  });

  // 프로필 이미지 상태
  const [profileImage, setProfileImage] = useState(null); // 업로드할 파일 객체
  const [profilePreview, setProfilePreview] = useState(defaultProfile);

  // UI 상태
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    message: "",
  });

  // 이메일 중복 확인 상태
  const [emailCheck, setEmailCheck] = useState({
    status: "",
    message: "",
  });

  // 닉네임 중복 확인 상태
  const [nicknameCheck, setNicknameCheck] = useState({
    status: "",
    message: "",
  });

  // ========================================
  // 유효성 검사 패턴 및 메시지
  // ========================================

  const emailPattern = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  const emailRuleMessage =
    "영문 이메일 형식만 가능합니다. 예: user@example.com";

  const nicknamePattern = /^[가-힣a-zA-Z0-9]{2,8}$/;
  const nicknameRuleMessage =
    "닉네임은 2~8자, 공백 없이 한글/영문/숫자만 가능합니다.";
  const nicknameCharPattern = /^[가-힣a-zA-Z0-9]+$/;
  const nicknameSpacePattern = /\s/;

  const passwordPattern =
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*()_+\-={}|:;'"<>,.?/]).{8,}$/;
  const passwordRuleMessage =
    "비밀번호는 대문자, 소문자, 숫자, 특수문자를 각각 1개 이상 포함해야 합니다.";

  // ========================================
  // 프로필 이미지 관련 함수
  // ========================================

  /**
   * 프로필 이미지 업로드 영역 클릭 핸들러
   * 숨겨진 파일 입력을 트리거합니다.
   */
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  /**
   * 파일 선택 핸들러
   * 선택된 이미지를 검증하고 미리보기를 생성합니다.
   */
  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // 파일 타입 검증 (이미지만 허용)
    if (!file.type.startsWith("image/")) {
      setError("이미지 파일만 업로드 가능합니다.");
      return;
    }

    // 파일 크기 검증 (5MB 제한)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError("이미지 크기는 5MB 이하여야 합니다.");
      return;
    }

    // 파일 객체 저장
    setProfileImage(file);

    // 미리보기 생성
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // 에러 메시지 초기화
    setError("");
  };

  /**
   * 프로필 이미지 제거 핸들러
   * 기본 이미지로 되돌립니다.
   */
  const handleRemoveImage = (e) => {
    e.stopPropagation(); // 클릭 이벤트 전파 방지
    setProfileImage(null);
    // 상단에서 import한 변수(defaultProfile)를 사용
    setProfilePreview(defaultProfile);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };
  // ========================================
  // 이메일 중복 확인
  // ========================================
  useEffect(() => {
    const checkEmail = async () => {
      if (!formData.email) {
        setEmailCheck({ status: "", message: "" });
        return;
      }

      if (!emailPattern.test(formData.email)) {
        setEmailCheck({ status: "error", message: emailRuleMessage });
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:9001/api/users/check/email?email=${formData.email}`
        );

        if (response.data.available) {
          setEmailCheck({
            status: "success",
            message: "사용 가능한 이메일입니다.",
          });
        } else {
          setEmailCheck({
            status: "error",
            message: "이미 사용 중인 이메일입니다.",
          });
        }
      } catch (error) {
        console.error("이메일 확인 오류:", error);
        setEmailCheck({
          status: "error",
          message: "이메일 확인 중 오류가 발생했습니다.",
        });
      }
    };

    const debounceTimer = setTimeout(checkEmail, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.email]);

  // ========================================
  // 닉네임 중복 확인
  // ========================================
  useEffect(() => {
    const checkNickname = async () => {
      const trimmedNickname = formData.nickname.trim();

      if (!trimmedNickname) {
        setNicknameCheck({ status: "", message: "" });
        return;
      }

      if (nicknameSpacePattern.test(trimmedNickname)) {
        setNicknameCheck({ status: "error", message: nicknameRuleMessage });
        return;
      }

      if (!nicknameCharPattern.test(trimmedNickname)) {
        setNicknameCheck({ status: "error", message: nicknameRuleMessage });
        return;
      }

      if (!nicknamePattern.test(trimmedNickname)) {
        setNicknameCheck({ status: "error", message: nicknameRuleMessage });
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:9001/api/users/check/nickname?nickname=${trimmedNickname}`
        );

        if (response.data.available) {
          setNicknameCheck({
            status: "success",
            message: "사용 가능한 닉네임입니다.",
          });
        } else {
          setNicknameCheck({
            status: "error",
            message: "이미 사용 중인 닉네임입니다.",
          });
        }
      } catch (error) {
        console.error("닉네임 확인 오류:", error);
        setNicknameCheck({
          status: "error",
          message: "닉네임 확인 중 오류가 발생했습니다.",
        });
      }
    };

    const debounceTimer = setTimeout(checkNickname, 500);
    return () => clearTimeout(debounceTimer);
  }, [formData.nickname]);

  // ========================================
  // 비밀번호 강도 체크
  // ========================================
  useEffect(() => {
    const checkPasswordStrength = () => {
      const password = formData.password;
      if (!password) {
        setPasswordStrength({ score: 0, message: "" });
        return;
      }

      let score = 0;
      let message = "";

      if (password.length >= 8) score++;
      if (/[a-z]/.test(password)) score++;
      if (/[A-Z]/.test(password)) score++;
      if (/\d/.test(password)) score++;
      if (/[!@#$%^&*()_+\-={}|:;'"<>,.?/]/.test(password)) score++;

      if (score <= 2) {
        message = "약함";
      } else if (score === 3 || score === 4) {
        message = "보통";
      } else {
        message = "강함";
      }

      setPasswordStrength({ score, message });
    };

    checkPasswordStrength();
  }, [formData.password]);

  // ========================================
  // 폼 제출 핸들러
  // ========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // 1. 이메일 검증
    if (!emailPattern.test(formData.email)) {
      setError(emailRuleMessage);
      return;
    }

    if (emailCheck.status !== "success") {
      setError("이메일 중복 확인이 필요합니다.");
      return;
    }

    // 2. 닉네임 검증
    const trimmedNickname = formData.nickname.trim();

    if (
      nicknameSpacePattern.test(trimmedNickname) ||
      !nicknameCharPattern.test(trimmedNickname)
    ) {
      setError(nicknameRuleMessage);
      return;
    }

    if (nicknameCheck.status !== "success") {
      setError("닉네임 중복 확인이 필요합니다.");
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

    setLoading(true);

    try {
      // FormData 생성 (프로필 이미지 포함)
      const submitData = new FormData();
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);
      submitData.append("nickname", formData.nickname);
      if (formData.bio) {
        submitData.append("bio", formData.bio);
      }
      if (profileImage) {
        submitData.append("profileImage", profileImage);
      }

      // 회원가입 API 호출
      await register(submitData);

      // 성공 시 메인 페이지로 이동
      navigate("/");
    } catch (error) {
      setError(error.response?.data?.message || "회원가입에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // 렌더링
  // ========================================

  return (
    <div className="auth-page">
      {/* 로고 섹션 */}
      <div className="auth-logo-section">
        <div className="debate-logo">
          <img
            src="/src/assets/debate-onlylogo.png"
            alt="DEBATE Logo"
            className="logo-image"
          />
        </div>
        <h1 className="auth-title">DEBATE</h1>
        <p className="auth-subtitle">토론에 참여하고 의견을 나누세요</p>
      </div>

      {/* 회원가입 폼 */}
      <div className="auth-container">
        <h2 className="form-title">회원가입</h2>

        {/* 전역 에러 메시지 */}
        {error && (
          <div className="validation-message error global-error">
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
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* ======================================== */}
          {/* 프로필 이미지 업로드 (폼 최상단) */}
          {/* ======================================== */}
          <div className="form-group profile-image-section">
            <label className="form-label">프로필 이미지</label>

            <div className="profile-image-container">
              {/* 프로필 이미지 미리보기 */}
              <div className="profile-image-preview" onClick={handleImageClick}>
                <img
                  src={profilePreview}
                  alt="프로필 미리보기"
                  className="profile-preview-img"
                />
                <div className="profile-image-overlay">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  <span>이미지 선택</span>
                </div>
              </div>

              {/* 숨겨진 파일 입력 */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="profile-image-input"
                style={{ display: "none" }}
              />

              {/* 이미지 제거 버튼 */}
              {profileImage && (
                <button
                  type="button"
                  className="btn-remove-image"
                  onClick={handleRemoveImage}
                >
                  이미지 제거
                </button>
              )}
            </div>

            <p className="form-help-text">JPG, PNG, GIF 형식 (최대 5MB)</p>
          </div>

          {/* 이메일 입력 */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
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
                emailCheck.status === "error"
                  ? "error"
                  : emailCheck.status === "success"
                  ? "success"
                  : ""
              }`}
              placeholder="email@example.com"
            />
            {emailCheck.message && (
              <div className={`validation-message ${emailCheck.status}`}>
                {emailCheck.status === "success" ? "✓" : "✗"}{" "}
                {emailCheck.message}
              </div>
            )}
          </div>

          {/* 닉네임 입력 */}
          <div className="form-group">
            <label htmlFor="nickname" className="form-label">
              닉네임
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
                nicknameCheck.status === "error"
                  ? "error"
                  : nicknameCheck.status === "success"
                  ? "success"
                  : ""
              }`}
              placeholder="닉네임 (2~8자)"
            />
            {nicknameCheck.message && (
              <div className={`validation-message ${nicknameCheck.status}`}>
                {nicknameCheck.status === "success" ? "✓" : "✗"}{" "}
                {nicknameCheck.message}
              </div>
            )}
          </div>

          {/* 비밀번호 입력 */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              비밀번호
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
              className="form-input"
              placeholder="8자 이상, 대소문자/숫자/특수문자 포함"
            />
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar-container">
                  <div
                    className={`strength-bar strength-${passwordStrength.score}`}
                  ></div>
                </div>
                <span
                  className={`strength-text strength-${passwordStrength.score}`}
                >
                  {passwordStrength.message}
                </span>
              </div>
            )}
          </div>

          {/* 비밀번호 확인 */}
          <div className="form-group">
            <label htmlFor="passwordConfirm" className="form-label">
              비밀번호 확인
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
            {formData.passwordConfirm && (
              <div
                className={`validation-message ${
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

          {/* 자기소개 */}
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

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            className="btn-debate btn-debate-primary"
            disabled={loading}
          >
            {loading ? (
              <span className="loading-content">
                <span className="spinner"></span>
                <span>가입 중...</span>
              </span>
            ) : (
              "회원가입"
            )}
          </button>
        </form>

        {/* 구분선 */}
        <div className="auth-divider">
          <span>이미 계정이 있으신가요?</span>
        </div>

        {/* 로그인 링크 */}
        <div className="auth-links">
          <Link to="/auth/login" className="link-primary">
            로그인하기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
