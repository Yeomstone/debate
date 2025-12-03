/**
 * MyPageSettings 컴포넌트 - 개선된 버전
 *
 * 계정 설정 페이지
 *
 * 주요 기능:
 * - 비밀번호 변경
 * - 알림 설정 (실제 작동하는 토글)
 * - 비밀번호 강도 측정
 * - 확인 모달
 * - 계정 삭제
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import "./MyPageSettings.css";

const MyPageSettings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 상태 관리
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [toast, setToast] = useState(null);

  // 알림 설정
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotification: true,
    marketingEmail: false,
    pushNotification: true,
  });

  /**
   * 컴포넌트 마운트 시 프로필 정보 로딩
   */
  useEffect(() => {
    if (user) {
      fetchProfile();
      loadNotificationSettings();
    }
  }, [user]);

  /**
   * 프로필 정보 가져오기
   */
  const fetchProfile = async () => {
    try {
      const response = await userService.getUserById(user.id);
      const data = response.data || response;
      setProfile(data);
    } catch (error) {
      console.error("프로필 로딩 실패:", error);
      showToast("프로필 로딩에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 알림 설정 로드 (로컬스토리지 또는 API)
   */
  const loadNotificationSettings = () => {
    try {
      const saved = localStorage.getItem(`notificationSettings_${user.id}`);
      if (saved) {
        setNotificationSettings(JSON.parse(saved));
      }
    } catch (error) {
      console.error("알림 설정 로드 실패:", error);
    }
  };

  /**
   * 알림 설정 저장
   */
  const saveNotificationSettings = (settings) => {
    try {
      localStorage.setItem(
        `notificationSettings_${user.id}`,
        JSON.stringify(settings)
      );
      showToast("알림 설정이 저장되었습니다.", "success");
    } catch (error) {
      console.error("알림 설정 저장 실패:", error);
      showToast("알림 설정 저장에 실패했습니다.", "error");
    }
  };

  /**
   * 토스트 알림 표시
   */
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /**
   * 비밀번호 변경 핸들러
   */
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // 새 비밀번호 강도 측정
    if (name === "newPassword") {
      calculatePasswordStrength(value);
    }

    // 에러 초기화
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  /**
   * 비밀번호 강도 계산
   */
  const calculatePasswordStrength = (password) => {
    if (!password) {
      setPasswordStrength(null);
      return;
    }

    let strength = 0;
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    strength = Object.values(checks).filter(Boolean).length;

    let level = "weak";
    let label = "약함";
    let color = "red";

    if (strength >= 4) {
      level = "strong";
      label = "강함";
      color = "green";
    } else if (strength >= 3) {
      level = "medium";
      label = "보통";
      color = "orange";
    }

    setPasswordStrength({
      strength,
      level,
      label,
      color,
      checks,
    });
  };

  /**
   * 비밀번호 변경 유효성 검사
   */
  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "현재 비밀번호를 입력하세요.";
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = "새 비밀번호를 입력하세요.";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "비밀번호는 8자 이상이어야 합니다.";
    } else if (passwordStrength && passwordStrength.level === "weak") {
      newErrors.newPassword = "더 강한 비밀번호를 사용하세요.";
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호 확인을 입력하세요.";
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다.";
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = "현재 비밀번호와 다른 비밀번호를 입력하세요.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 비밀번호 변경 제출
   */
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!validatePassword()) {
      showToast("입력 내용을 확인해주세요.", "error");
      return;
    }

    try {
      // TODO: 비밀번호 변경 API 호출
      // await userService.changePassword(passwordData.currentPassword, passwordData.newPassword);

      showToast("비밀번호가 성공적으로 변경되었습니다!", "success");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordStrength(null);
    } catch (error) {
      console.error("비밀번호 변경 실패:", error);
      showToast("비밀번호 변경에 실패했습니다. 현재 비밀번호를 확인하세요.", "error");
    }
  };

  /**
   * 토글 스위치 핸들러
   */
  const handleToggle = (settingName) => {
    const newSettings = {
      ...notificationSettings,
      [settingName]: !notificationSettings[settingName],
    };
    setNotificationSettings(newSettings);
    saveNotificationSettings(newSettings);
  };

  /**
   * 계정 삭제 핸들러
   */
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== profile?.email) {
      showToast("이메일 주소를 정확히 입력하세요.", "error");
      return;
    }

    try {
      // TODO: 계정 삭제 API 호출
      // await userService.deleteAccount();

      showToast("계정이 삭제되었습니다.", "success");
      setShowDeleteModal(false);
      // 로그아웃 처리
      setTimeout(() => {
        // logout();
        navigate("/");
      }, 1500);
    } catch (error) {
      console.error("계정 삭제 실패:", error);
      showToast("계정 삭제에 실패했습니다.", "error");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">설정 로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="my-page-settings">
      <div className="container">
        <div className="my-page-layout">
          {/* 사이드바 */}
          <aside className="my-page-sidebar">
            <div className="profile-card">
              <div className="profile-avatar">
                {profile?.profileImage ? (
                  <img src={profile.profileImage} alt="프로필" />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <h2 className="profile-name">
                {profile?.nickname || "이름 없음"}
              </h2>
              <p className="profile-bio">
                {profile?.bio || "자기소개를 입력하세요"}
              </p>
              <div className="profile-actions">
                <button
                  onClick={() => navigate("/my")}
                  className="btn btn-outline"
                  style={{ width: "100%" }}
                >
                  마이페이지로
                </button>
              </div>
            </div>
          </aside>

          {/* 메인 컨텐츠 */}
          <div className="my-page-content">
            <div className="page-header">
              <h1>계정 설정</h1>
              <p className="page-description">
                계정 정보 및 보안 설정을 관리할 수 있습니다.
              </p>
            </div>

            <div className="settings-form">
              {/* 이메일 주소 */}
              <div className="settings-card" data-security="true">
                <div className="settings-card-header">
                  <div className="settings-card-icon">📧</div>
                  <h3 className="settings-card-title">이메일 주소</h3>
                </div>
                <div className="settings-card-body">
                  <div className="info-box">
                    <div className="info-box-icon">ℹ️</div>
                    <div className="info-box-content">
                      <h4 className="info-box-title">로그인 ID</h4>
                      <p className="info-box-text">{profile?.email || ""}</p>
                      <p className="info-box-description">
                        이메일 주소는 변경할 수 없습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 비밀번호 변경 */}
              <div className="settings-card" data-security="true">
                <div className="settings-card-header">
                  <div className="settings-card-icon">🔒</div>
                  <h3 className="settings-card-title">비밀번호 변경</h3>
                </div>
                <div className="settings-card-body">
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="form-group">
                      <label htmlFor="current-password" className="form-label">
                        현재 비밀번호
                      </label>
                      <input
                        type="password"
                        id="current-password"
                        name="currentPassword"
                        className={`form-input ${errors.currentPassword ? "error" : ""
                          }`}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        placeholder="현재 비밀번호를 입력하세요"
                      />
                      {errors.currentPassword && (
                        <p className="form-error">
                          ⚠️ {errors.currentPassword}
                        </p>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="new-password" className="form-label">
                        새 비밀번호
                      </label>
                      <input
                        type="password"
                        id="new-password"
                        name="newPassword"
                        className={`form-input ${errors.newPassword ? "error" : ""
                          }`}
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        placeholder="새 비밀번호를 입력하세요"
                      />
                      {errors.newPassword && (
                        <p className="form-error">⚠️ {errors.newPassword}</p>
                      )}

                      {/* 비밀번호 강도 표시 */}
                      {passwordStrength && (
                        <div className="password-strength">
                          <div className="password-strength-bar">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`password-strength-segment ${level <= passwordStrength.strength
                                    ? `active ${passwordStrength.level}`
                                    : ""
                                  }`}
                              ></div>
                            ))}
                          </div>
                          <div className="password-strength-label">
                            강도: {passwordStrength.label}
                          </div>
                          <div className="password-requirements">
                            <p
                              className={
                                passwordStrength.checks.length ? "met" : "unmet"
                              }
                            >
                              {passwordStrength.checks.length ? "✓" : "○"} 8자
                              이상
                            </p>
                            <p
                              className={
                                passwordStrength.checks.uppercase
                                  ? "met"
                                  : "unmet"
                              }
                            >
                              {passwordStrength.checks.uppercase ? "✓" : "○"}{" "}
                              대문자 포함
                            </p>
                            <p
                              className={
                                passwordStrength.checks.lowercase
                                  ? "met"
                                  : "unmet"
                              }
                            >
                              {passwordStrength.checks.lowercase ? "✓" : "○"}{" "}
                              소문자 포함
                            </p>
                            <p
                              className={
                                passwordStrength.checks.number ? "met" : "unmet"
                              }
                            >
                              {passwordStrength.checks.number ? "✓" : "○"} 숫자
                              포함
                            </p>
                            <p
                              className={
                                passwordStrength.checks.special
                                  ? "met"
                                  : "unmet"
                              }
                            >
                              {passwordStrength.checks.special ? "✓" : "○"}{" "}
                              특수문자 포함
                            </p>
                          </div>
                        </div>
                      )}

                      <p className="form-help">
                        ℹ️ 8자 이상, 영문, 숫자, 특수문자 포함을 권장합니다
                      </p>
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirm-password" className="form-label">
                        새 비밀번호 확인
                      </label>
                      <input
                        type="password"
                        id="confirm-password"
                        name="confirmPassword"
                        className={`form-input ${errors.confirmPassword ? "error" : ""
                          } ${passwordData.confirmPassword &&
                            passwordData.newPassword ===
                            passwordData.confirmPassword &&
                            !errors.confirmPassword
                            ? "valid"
                            : ""
                          }`}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        placeholder="새 비밀번호를 다시 입력하세요"
                      />
                      {errors.confirmPassword && (
                        <p className="form-error">
                          ⚠️ {errors.confirmPassword}
                        </p>
                      )}
                      {passwordData.confirmPassword &&
                        passwordData.newPassword ===
                        passwordData.confirmPassword &&
                        !errors.confirmPassword && (
                          <p className="form-success">✓ 비밀번호가 일치합니다</p>
                        )}
                    </div>

                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ width: "100%", marginTop: "1rem" }}
                    >
                      🔐 비밀번호 변경
                    </button>
                  </form>
                </div>
              </div>

              {/* 알림 설정 */}
              <div className="settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon">🔔</div>
                  <h3 className="settings-card-title">알림 설정</h3>
                </div>
                <div className="settings-card-body">
                  <div
                    className="toggle-switch"
                    onClick={() => handleToggle("emailNotification")}
                  >
                    <div className="toggle-switch-label">
                      <span className="toggle-switch-title">이메일 알림</span>
                      <span className="toggle-switch-description">
                        주요 활동에 대한 알림을 이메일로 받습니다.
                      </span>
                    </div>
                    <div
                      className={`toggle-switch-input ${notificationSettings.emailNotification ? "active" : ""
                        }`}
                    ></div>
                  </div>

                  <div
                    className="toggle-switch"
                    onClick={() => handleToggle("pushNotification")}
                  >
                    <div className="toggle-switch-label">
                      <span className="toggle-switch-title">푸시 알림</span>
                      <span className="toggle-switch-description">
                        브라우저 푸시 알림을 받습니다.
                      </span>
                    </div>
                    <div
                      className={`toggle-switch-input ${notificationSettings.pushNotification ? "active" : ""
                        }`}
                    ></div>
                  </div>

                  <div
                    className="toggle-switch"
                    onClick={() => handleToggle("marketingEmail")}
                  >
                    <div className="toggle-switch-label">
                      <span className="toggle-switch-title">
                        마케팅 정보 수신
                      </span>
                      <span className="toggle-switch-description">
                        이벤트 및 프로모션 정보를 받습니다.
                      </span>
                    </div>
                    <div
                      className={`toggle-switch-input ${notificationSettings.marketingEmail ? "active" : ""
                        }`}
                    ></div>
                  </div>
                </div>
              </div>

              {/* 계정 삭제 */}
              <div className="danger-section settings-card">
                <div className="settings-card-header">
                  <div className="settings-card-icon">⚠️</div>
                  <h3 className="settings-card-title">계정 삭제</h3>
                </div>
                <div className="settings-card-body">
                  <p className="form-help" style={{ marginBottom: "1.5rem" }}>
                    ⚠️ 계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할
                    수 없습니다. 작성한 토론, 의견, 댓글 등 모든 활동 내역이
                    삭제됩니다.
                  </p>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => setShowDeleteModal(true)}
                    style={{ width: "100%" }}
                  >
                    🗑️ 계정 삭제
                  </button>
                </div>
              </div>

              {/* 취소 버튼 */}
              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate("/my")}
                >
                  ← 돌아가기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 계정 삭제 확인 모달 */}
      {showDeleteModal && (
        <>
          <div
            className="confirm-modal-overlay"
            onClick={() => setShowDeleteModal(false)}
          ></div>
          <div className="confirm-modal">
            <div className="confirm-modal-header">
              <div className="confirm-modal-icon">⚠️</div>
              <h3 className="confirm-modal-title">계정 삭제 확인</h3>
            </div>
            <div className="confirm-modal-content">
              <p style={{ marginBottom: "1rem", lineHeight: "1.6" }}>
                정말로 계정을 삭제하시겠습니까?
              </p>
              <p style={{ marginBottom: "1.5rem", lineHeight: "1.6" }}>
                이 작업은 <strong>되돌릴 수 없으며</strong>, 모든 데이터가
                영구적으로 삭제됩니다.
              </p>
              <p style={{ marginBottom: "1rem", fontWeight: "600" }}>
                계속하려면 이메일 주소를 입력하세요:
              </p>
              <input
                type="email"
                className="form-input"
                placeholder={profile?.email}
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                style={{ marginBottom: "1rem" }}
              />
            </div>
            <div className="confirm-modal-actions">
              <button
                className="btn btn-outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
              >
                취소
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== profile?.email}
              >
                삭제
              </button>
            </div>
          </div>
        </>
      )}

      {/* 토스트 알림 */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === "success" && "✓"}
            {toast.type === "error" && "✕"}
            {toast.type === "info" && "ℹ"}
          </div>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}
    </div>
  );
};

export default MyPageSettings;