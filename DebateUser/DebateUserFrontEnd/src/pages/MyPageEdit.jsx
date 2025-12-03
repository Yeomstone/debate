/**
 * MyPageEdit 컴포넌트 - 간격 수정 버전
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import axios from "axios";
import defaultProfileImage from "../assets/default-profile.png";
import "./MyPageEdit.css";

const MyPageEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // ========================================
  // 정규식 상수
  // ========================================
  const nicknameCharPattern = /^[가-힣a-zA-Z0-9]+$/; // 한글/영문/숫자만
  const nicknameSpacePattern = /\s/; // 공백 여부

  // ========================================
  // 상태 관리
  // ========================================
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nickname: "",
    bio: "",
    profileImage: "",
  });

  const [originalData, setOriginalData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [toast, setToast] = useState(null);

  // 닉네임 검사 상태
  const [nicknameCheck, setNicknameCheck] = useState({
    status: "idle",
    message: "",
  });

  /**
   * 컴포넌트 마운트 시 프로필 정보 로딩
   */
  useEffect(() => {
    if (user) {
      fetchProfile();
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

      const initialData = {
        nickname: data.nickname || "",
        bio: data.bio || "",
        profileImage: data.profileImage || "",
      };

      setFormData(initialData);
      setOriginalData(initialData);

      setNicknameCheck({ status: "success", message: "" });
    } catch (error) {
      console.error("프로필 로딩 실패:", error);
      showToast("프로필 로딩에 실패했습니다.", "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * 중복 확인 API 함수
   */
  const checkDuplicateAPI = async (type, value) => {
    const endpoint = "/auth/check-nickname";
    const paramName = type;

    try {
      await axios.get(`${endpoint}?${paramName}=${value}`);
      return true;
    } catch (error) {
      let message = "";
      if (error.response) {
        if (error.response.status === 409) {
          message =
            error.response.data?.message || "이미 사용 중인 닉네임입니다.";
        } else {
          message = "확인 중 오류가 발생했습니다.";
        }
      } else if (error.request) {
        message = "서버와 연결할 수 없습니다.";
      } else {
        message = "에러가 발생했습니다.";
      }
      throw new Error(message);
    }
  };

  /**
   * 토스트 알림
   */
  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /**
   * 변경사항 확인
   */
  const hasChanges = () => {
    if (!originalData) return false;
    return (
      formData.nickname !== originalData.nickname ||
      formData.bio !== originalData.bio ||
      formData.profileImage !== originalData.profileImage
    );
  };

  /**
   * 폼 입력 핸들러
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "bio") {
      if (value && value.length > 200) {
        setErrors((prev) => ({
          ...prev,
          bio: "자기소개는 최대 200자까지 입력 가능합니다.",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.bio;
          return newErrors;
        });
      }
    }
  };

  /**
   * 닉네임 실시간 유효성 검사 Effect
   */
  useEffect(() => {
    if (!originalData) return;

    const timer = setTimeout(async () => {
      const raw = formData.nickname;
      const trimmed = raw.trim();

      if (!trimmed) {
        setNicknameCheck({ status: "idle", message: "" });
        return;
      }

      if (trimmed === originalData.nickname) {
        setNicknameCheck({
          status: "success",
          message: "현재 사용 중인 닉네임입니다.",
        });
        return;
      }

      if (nicknameSpacePattern.test(raw)) {
        setNicknameCheck({
          status: "error",
          message: "닉네임에 공백은 사용할 수 없습니다.",
        });
        return;
      }

      if (trimmed.length < 2) {
        setNicknameCheck({
          status: "error",
          message: "닉네임은 2자 이상 입력해주세요.",
        });
        return;
      }

      if (trimmed.length > 8) {
        setNicknameCheck({
          status: "error",
          message: "닉네임은 8자 이내로 입력해주세요.",
        });
        return;
      }

      if (!nicknameCharPattern.test(trimmed)) {
        setNicknameCheck({
          status: "error",
          message: "닉네임은 한글/영문/숫자만 사용할 수 있습니다.",
        });
        return;
      }

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
  }, [formData.nickname, originalData]);

  /**
   * 폼 제출
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (nicknameCheck.status !== "success" && nicknameCheck.status !== "idle") {
      if (formData.nickname !== originalData.nickname) {
        showToast(nicknameCheck.message || "닉네임을 확인해주세요.", "error");
        return;
      }
    }

    if (Object.keys(errors).length > 0) {
      showToast("입력 내용을 확인해주세요.", "error");
      return;
    }

    if (!hasChanges()) {
      showToast("변경된 내용이 없습니다.", "info");
      return;
    }

    setSaving(true);
    try {
      await userService.updateProfile(
        formData.nickname || null,
        formData.bio || null,
        formData.profileImage || null
      );
      showToast("프로필이 성공적으로 수정되었습니다!", "success");
      setOriginalData(formData);
      setNicknameCheck({ status: "success", message: "" });
      setTimeout(() => navigate("/my"), 1500);
    } catch (error) {
      console.error("프로필 수정 실패:", error);
      showToast("프로필 수정에 실패했습니다. 다시 시도해주세요.", "error");
    } finally {
      setSaving(false);
    }
  };

  // 이미지 관련 핸들러들
  const validateImageFile = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      showToast("파일 크기는 10MB 이하여야 합니다.", "error");
      return false;
    }
    if (!file.type.startsWith("image/")) {
      showToast("이미지 파일만 업로드 가능합니다.", "error");
      return false;
    }
    return true;
  };

  const handleImageUpload = async (file) => {
    if (!file || !validateImageFile(file)) return;

    try {
      setUploadProgress(0);
      const reader = new FileReader();
      reader.onloadstart = () => setUploadProgress(20);
      reader.onprogress = (e) => {
        if (e.lengthComputable) {
          const progress = 20 + (e.loaded / e.total) * 30;
          setUploadProgress(progress);
        }
      };
      reader.onload = async (e) => {
        setUploadProgress(50);
        setFormData((prev) => ({ ...prev, profileImage: e.target.result }));
        try {
          setUploadProgress(70);
          const imageUrl = await userService.uploadImage(file);
          setUploadProgress(100);
          setFormData((prev) => ({ ...prev, profileImage: imageUrl }));
          showToast("이미지가 업로드되었습니다.", "success");
          setTimeout(() => setUploadProgress(0), 1000);
        } catch (uploadError) {
          showToast("이미지 업로드 실패", "error");
          setUploadProgress(0);
          setFormData((prev) => ({
            ...prev,
            profileImage: originalData?.profileImage || "",
          }));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      showToast("이미지 처리 실패", "error");
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) handleImageUpload(file);
  };
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleImageUpload(file);
  };
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, profileImage: defaultProfileImage }));
    showToast("기본 이미지로 변경되었습니다.", "info");
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasChanges()) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [formData, originalData]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="my-page-edit">
      <div className="container">
        <div className="my-page-layout">
          {/* 사이드바 */}
          <aside className="my-page-sidebar">
            <div className="profile-card">
              <div className="profile-avatar">
                {formData.profileImage ? (
                  <img src={formData.profileImage} alt="프로필" />
                ) : (
                  <span>👤</span>
                )}
              </div>
              <h2 className="profile-name">
                {formData.nickname || "이름 없음"}
              </h2>
              <p className="profile-bio">
                {formData.bio || "자기소개를 입력하세요"}
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
              {hasChanges() && (
                <div className="changes-indicator">
                  <span className="changes-dot"></span>
                  <span className="changes-text">변경사항이 있습니다</span>
                </div>
              )}
            </div>
          </aside>

          {/* 메인 컨텐츠 */}
          <div className="my-page-content">
            <div className="page-header">
              <h1>프로필 수정</h1>
              <p className="page-description">
                프로필 정보를 수정할 수 있습니다.
              </p>
            </div>

            <form className="profile-edit-form" onSubmit={handleSubmit}>
              {/* 프로필 사진 섹션 */}
              <div className="form-section">
                <div className="profile-photo-section">
                  <h3 className="section-title-centered">프로필 사진</h3>
                  <div
                    className={`profile-photo-preview ${isDragging ? "dragging" : ""
                      }`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="profile-avatar-large">
                      {formData.profileImage ? (
                        <img src={formData.profileImage} alt="프로필" />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                    {uploadProgress > 0 && uploadProgress < 100 && (
                      <div className="upload-progress">
                        <div
                          className="upload-progress-bar"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    )}
                    {isDragging && (
                      <div className="drag-overlay">
                        <p>이미지를 여기에 놓으세요</p>
                      </div>
                    )}
                  </div>
                  <div className="profile-photo-actions">
                    <label htmlFor="profile-photo" className="btn btn-outline">
                      📁 사진 업로드
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      id="profile-photo"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleFileInputChange}
                    />
                    {formData.profileImage && (
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={handleRemoveImage}
                      >
                        🗑️ 기본 이미지로 변경
                      </button>
                    )}
                  </div>
                  <p className="form-help">
                    💡 JPG, PNG 형식만 지원됩니다. 최대 10MB (드래그 앤 드롭
                    지원)
                  </p>
                </div>
              </div>

              {/* [수정됨] 닉네임 섹션 (간격 문제 해결) */}
              <div
                className="form-section form-section-narrow"
                style={{
                  flex: "none", // 높이가 불필요하게 늘어나는 것 방지
                  height: "auto", // 콘텐츠 크기에 맞춤
                  marginBottom: "2rem", // 하단 여백 적절하게 조정
                }}
              >
                <div className="nickname-input-wrapper">
                  <label htmlFor="nickname" className="form-label">
                    닉네임
                  </label>
                  <input
                    type="text"
                    id="nickname"
                    name="nickname"
                    className={`form-input form-input-nickname ${nicknameCheck.status === "error" ? "error" : ""
                      } ${nicknameCheck.status === "success" ? "valid" : ""}`}
                    value={formData.nickname}
                    onChange={handleChange}
                    placeholder="닉네임은 2~8자, 공백 없이 한글/영문/숫자만 가능합니다."
                  />
                </div>

                {/* 메시지 영역: 메시지가 있을 때만 렌더링되지만 높이를 차지하지 않도록 조정 */}
                <div
                  className="nickname-footer"
                  style={{ minHeight: "auto", marginTop: "0.5rem" }}
                >
                  {nicknameCheck.message && (
                    <span
                      className={`validation-message ${nicknameCheck.status === "error"
                          ? "form-error"
                          : nicknameCheck.status === "success"
                            ? "form-success"
                            : "form-info"
                        }`}
                    >
                      {nicknameCheck.status === "error"
                        ? "⚠️ "
                        : nicknameCheck.status === "success"
                          ? "✓ "
                          : ""}
                      {nicknameCheck.message}
                    </span>
                  )}
                </div>
              </div>

              {/* 소개 섹션 */}
              <div className="form-section form-section-wide">
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "0.75rem",
                  }}
                >
                  <label
                    htmlFor="bio"
                    className="form-label"
                    style={{ marginBottom: 0, marginRight: "0.5rem" }}
                  >
                    소개
                  </label>
                </div>
                <textarea
                  id="bio"
                  name="bio"
                  className={`form-textarea form-textarea-bio ${errors.bio ? "error" : ""
                    }`}
                  rows="4"
                  value={formData.bio}
                  onChange={handleChange}
                  maxLength={200}
                  placeholder="자신을 표현하는 한마디를 적어주세요 (최대 200자)"
                />
                <div className="textarea-footer">
                  {errors.bio && (
                    <span className="form-error">⚠️ {errors.bio}</span>
                  )}
                  <span
                    className={`character-count ${formData.bio.length >= 180 ? "warning" : ""
                      } ${formData.bio.length >= 200 ? "error" : ""}`}
                  >
                    {formData.bio.length} / 200자
                  </span>
                </div>
              </div>

              {/* 버튼 영역 */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={
                    saving ||
                    !hasChanges() ||
                    Object.keys(errors).length > 0 ||
                    nicknameCheck.status === "error" ||
                    nicknameCheck.status === "loading"
                  }
                >
                  {saving ? (
                    <>
                      <span className="btn-spinner"></span>저장 중...
                    </>
                  ) : (
                    <>💾 저장하기</>
                  )}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => {
                    if (
                      hasChanges() &&
                      !window.confirm(
                        "변경사항이 저장되지 않았습니다. 정말 나가시겠습니까?"
                      )
                    )
                      return;
                    navigate("/my");
                  }}
                >
                  ← 취소
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {toast && (
        <div className={`toast toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === "success" && "✓"} {toast.type === "error" && "✕"}{" "}
            {toast.type === "info" && "ℹ"}
          </div>
          <div className="toast-message">{toast.message}</div>
        </div>
      )}
    </div>
  );
};

export default MyPageEdit;
