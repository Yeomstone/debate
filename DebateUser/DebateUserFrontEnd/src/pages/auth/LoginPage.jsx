import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import "./LoginPageAnimated.css";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const isDarkMode = theme === "dark";

  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);
  const characterAreaRef = useRef(null);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // 인터랙션 상태
  const [isPasswordFocus, setIsPasswordFocus] = useState(false);
  const [pupilPos, setPupilPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);

  // 마우스 추적 (눈동자)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isPasswordFocus || !characterAreaRef.current) return;

      const rect = characterAreaRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const moveX = (e.clientX - centerX) / 35;
      const moveY = (e.clientY - centerY) / 35;

      setPupilPos({
        x: Math.max(-5, Math.min(5, moveX)),
        y: Math.max(-3, Math.min(3, moveY)),
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [isPasswordFocus]);

  const handleEmailFocus = () => {
    setIsPasswordFocus(false);
    setError("");
  };

  const handlePasswordFocus = () => {
    setIsPasswordFocus(true);
    setError("");
  };

  const handleBlur = () => {
    setIsPasswordFocus(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "이메일 또는 비밀번호가 올바르지 않습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  // 눈동자 스타일
  const pupilStyle = {
    transform: `translate(${pupilPos.x}px, ${pupilPos.y}px)`,
  };

  return (
    <div className={`login-wrapper ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      <div className="login-container">
        {/* 왼쪽: 캐릭터 섹션 */}
        <div className="character-section" ref={characterAreaRef}>
          <div className="brand-header">
            <h1 className="main-title">DEBATE</h1>
            <p className="main-subtitle">
              다양한 주제로 여러분의 의견을 나눠보세요.
            </p>
          </div>

          <div
            className={`logo-characters ${isPasswordFocus ? "password-active" : ""
              }`}
          >
            {/* ===== 왼쪽 캐릭터 (Left Debater) ===== */}
            <div className="debater-char left-char">
              <svg viewBox="0 0 200 240" className="char-svg">
                {/* [다크모드 아이템] 망토 (뒤) */}
                <path
                  className="mafia-cape-back"
                  d="M20,160 Q-10,240 40,240 L160,240 Q190,240 160,160 Z"
                />

                {/* 몸체 */}
                <path
                  className="char-body"
                  d="M40,60 L140,60 Q170,60 170,90 L130,160 Q120,180 90,180 L40,180 Q10,180 10,150 L10,90 Q10,60 40,60 Z"
                />

                {/* 눈 영역 (다크모드에서 빛남) */}
                <g className="eye-group" transform="translate(60, 100)">
                  <circle className="char-eye-white" cx="0" cy="0" r="14" />
                  <circle
                    className="char-pupil"
                    cx="0"
                    cy="0"
                    r="6"
                    style={pupilStyle}
                  />
                </g>

                {/* 감은 눈 (비밀번호 모드) */}
                <path
                  className="closed-eye"
                  d="M45,105 Q60,95 75,105"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* [다크모드 아이템] 페도라 모자 */}
                <g className="mafia-hat">
                  <ellipse cx="100" cy="65" rx="70" ry="20" fill="#121212" />
                  <path
                    d="M50,65 Q50,10 100,10 Q150,10 150,65"
                    fill="#121212"
                  />
                  <path
                    d="M52,55 Q100,65 148,55 L148,65 Q100,75 52,65 Z"
                    fill="#FFC107"
                  />
                </g>
              </svg>
            </div>

            {/* ===== 오른쪽 캐릭터 (Right Debater) ===== */}
            <div className="debater-char right-char">
              <svg viewBox="0 0 200 240" className="char-svg">
                {/* [다크모드 아이템] 망토 (뒤) */}
                <path
                  className="mafia-cape-back"
                  d="M180,160 Q210,240 160,240 L40,240 Q10,240 40,160 Z"
                />

                {/* 몸체 */}
                <path
                  className="char-body"
                  d="M160,60 L60,60 Q30,60 30,90 L70,160 Q80,180 110,180 L160,180 Q190,180 190,150 L190,90 Q190,60 160,60 Z"
                />

                {/* 눈 영역 */}
                <g className="eye-group" transform="translate(140, 100)">
                  <circle className="char-eye-white" cx="0" cy="0" r="14" />
                  <circle
                    className="char-pupil"
                    cx="0"
                    cy="0"
                    r="6"
                    style={pupilStyle}
                  />
                </g>

                {/* 감은 눈 */}
                <path
                  className="closed-eye"
                  d="M125,105 Q140,95 155,105"
                  strokeWidth="4"
                  strokeLinecap="round"
                  fill="none"
                />

                {/* [다크모드 아이템] 페도라 모자 */}
                <g className="mafia-hat" transform="rotate(5, 100, 50)">
                  <ellipse cx="100" cy="65" rx="70" ry="20" fill="#121212" />
                  <path
                    d="M50,65 Q50,10 100,10 Q150,10 150,65"
                    fill="#121212"
                  />
                  <path
                    d="M52,55 Q100,65 148,55 L148,65 Q100,75 52,65 Z"
                    fill="#FFC107"
                  />
                </g>
              </svg>
            </div>
          </div>
        </div>

        {/* 오른쪽: 폼 섹션 */}
        <div className="form-section">
          <div className="form-wrapper">
            <h2 className="form-title">로그인</h2>
            <p className="form-subtitle">이메일과 비밀번호를 입력하세요.</p>

            {error && (
              <div className="error-box">
                <span>⚠️ {error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="login-form">
              <div className="input-group">
                <label htmlFor="email" className="input-label">
                  이메일
                </label>
                <input
                  ref={emailInputRef}
                  type="email"
                  id="email"
                  className="text-input"
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={handleEmailFocus}
                  onBlur={handleBlur}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="password" className="input-label">
                  비밀번호
                </label>
                <input
                  ref={passwordInputRef}
                  type="password"
                  id="password"
                  className="text-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handlePasswordFocus}
                  onBlur={handleBlur}
                  required
                />
              </div>

              <div className="form-options">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkbox-custom"></span>
                  로그인 유지
                </label>
                <Link to="/auth/forgot-password" className="link-forgot">
                  비밀번호 찾기
                </Link>
              </div>

              <button type="submit" className="submit-btn" disabled={loading}>
                {loading ? "로그인 중..." : "로그인"}
              </button>
            </form>

            <div className="divider">
              <span>또는</span>
            </div>

            <div className="signup-link-wrapper">
              계정이 없으신가요?{" "}
              <Link to="/auth/register" className="link-signup">
                회원가입
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
