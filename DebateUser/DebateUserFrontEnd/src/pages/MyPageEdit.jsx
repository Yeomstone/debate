/**
 * MyPageEdit 컴포넌트 - 개선된 버전
 *
 * 프로필 수정 페이지
 *
 * 주요 기능:
 * - 닉네임 수정
 * - 자기소개 수정
 * - 프로필 이미지 업로드 (드래그 앤 드롭 지원)
 * - 실시간 유효성 검사
 * - 토스트 알림
 * - 변경사항 감지
 */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import UserAvatar from "../components/common/UserAvatar";
import "./MyPageEdit.css";

const MyPageEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // 상태 관리
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
    } catch (error) {
      console.error("프로필 로딩 실패:", error);
      showToast("프로필 로딩에 실패했습니다.", "error");
    } finally {
      setLoading(false);
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
   * 변경사항 여부 확인
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
    // 실시간 유효성 검사
    validateField(name, value);
  };

  /**
   * 필드별 실시간 유효성 검사
   */
  const validateField = (name, value) => {
    const newErrors = { ...errors };

    if (name === "nickname") {
      if (value && (value.length < 2 || value.length > 20)) {
        newErrors.nickname = "닉네임은 2-20자 사이여야 합니다.";
      } else {
        delete newErrors.nickname;
      }
    }

    if (name === "bio") {
      if (value && value.length > 200) {
        newErrors.bio = "자기소개는 최대 200자까지 입력 가능합니다.";
      } else {
        delete newErrors.bio;
      }
    }

    setErrors(newErrors);
  };

  /**
   * 폼 유효성 검사
   */
  const validateForm = () => {
    const newErrors = {};

    if (
      formData.nickname &&
      (formData.nickname.length < 2 || formData.nickname.length > 20)
    ) {
      newErrors.nickname = "닉네임은 2-20자 사이여야 합니다.";
    }

    if (formData.bio && formData.bio.length > 200) {
      newErrors.bio = "자기소개는 최대 200자까지 입력 가능합니다.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * 폼 제출 핸들러
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
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
      setTimeout(() => navigate("/my"), 1500);
    } catch (error) {
      console.error("프로필 수정 실패:", error);
      showToast("프로필 수정에 실패했습니다. 다시 시도해주세요.", "error");
    } finally {
      setSaving(false);
    }
  };

  /**
   * 이미지 파일 유효성 검사
   */
  const validateImageFile = (file) => {
    // 파일 크기 제한 (10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast("파일 크기는 10MB 이하여야 합니다.", "error");
      return false;
    }

    // 이미지 파일 타입 확인
    if (!file.type.startsWith("image/")) {
      showToast("이미지 파일만 업로드 가능합니다.", "error");
      return false;
    }

    return true;
  };

  /**
   * 프로필 이미지 업로드 핸들러
   */
  const handleImageUpload = async (file) => {
    if (!file || !validateImageFile(file)) return;

    try {
      setUploadProgress(0);

      // 이미지 미리보기 (Base64)
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

        // 임시 미리보기 설정
        setFormData((prev) => ({
          ...prev,
          profileImage: e.target.result,
        }));

        // 실제 업로드
        try {
          setUploadProgress(70);
          const imageUrl = await userService.uploadImage(file);
          setUploadProgress(100);

          // 최종 URL로 업데이트
          setFormData((prev) => ({
            ...prev,
            profileImage: imageUrl,
          }));

          showToast("이미지가 업로드되었습니다.", "success");
          setTimeout(() => setUploadProgress(0), 1000);
        } catch (uploadError) {
          console.error("이미지 업로드 실패:", uploadError);
          showToast("이미지 업로드에 실패했습니다.", "error");
          setUploadProgress(0);
          // 미리보기 이미지 제거
          setFormData((prev) => ({
            ...prev,
            profileImage: originalData?.profileImage || "",
          }));
        }
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("이미지 처리 실패:", error);
      showToast("이미지 처리에 실패했습니다.", "error");
      setUploadProgress(0);
    }
  };

  /**
   * 파일 input 변경 핸들러
   */
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageUpload(file);
    }
  };

  /**
   * 드래그 앤 드롭 핸들러
   */
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
    if (file) {
      handleImageUpload(file);
    }
  };

  /**
   * 기본 이미지로 변경
   */
  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, profileImage: "" }));
    showToast("기본 이미지로 변경되었습니다.", "info");
  };
  /**
   * 페이지 나가기 확인
   */
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
        <p className="loading-text">프로필 로딩 중...</p>
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
                <UserAvatar
                  src={formData.profileImage}
                  alt="프로필"
                  size="large"
                />
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

              {/* 변경사항 알림 */}
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
              {/* 프로필 사진 */}
              <div className="form-section">
                <div className="profile-photo-section">
                  <h3 className="section-title-centered">프로필 사진</h3>
                  <div
                    className={`profile-photo-preview ${isDragging ? "dragging" : ""}`}
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  >
                    <div className="profile-avatar-large">
                      <UserAvatar
                        src={formData.profileImage}
                        alt="프로필"
                        size="xlarge"
                      />
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

              {/* 닉네임 */}
              <div className="form-section form-section-narrow">
                <div className="nickname-input-wrapper">
                  <label htmlFor="nickname" className="form-label">닉네임</label>
                  <input
                    type="text"
                    id="nickname"
                    name="nickname"
                    className={`form-input form-input-nickname ${errors.nickname ? "error" : ""} ${formData.nickname && !errors.nickname ? "valid" : ""}`}
                    value={formData.nickname}
                    onChange={handleChange}
                    placeholder="2-20자 사이의 닉네임을 입력하세요"
                  />
                </div>
                <div className="nickname-footer">
                  {errors.nickname && (
                    <span className="form-error">⚠️ {errors.nickname}</span>
                  )}
                  {!errors.nickname && formData.nickname && (
                    <span className="form-success">✓ 사용 가능한 닉네임입니다</span>
                  )}
                </div>
              </div>

              {/* 소개 */}
              <div className="form-section form-section-wide">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <label htmlFor="bio" className="form-label" style={{ marginBottom: 0, marginRight: '0.5rem' }}>
                    소개
                  </label>
                </div>
                <textarea
                  id="bio"
                  name="bio"
                  className={`form-textarea form-textarea-bio ${errors.bio ? "error" : ""} ${formData.bio && !errors.bio ? "valid" : ""}`}
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
                    className={`character-count ${formData.bio.length >= 180 ? "warning" : ""} ${formData.bio.length >= 200 ? "error" : ""}`}
                  >
                    {formData.bio.length} / 200자
                  </span>
                </div>
              </div>
              {/* 저장 버튼 */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving || !hasChanges() || Object.keys(errors).length > 0}
                >
                  {saving ? (
                    <>
                      <span className="btn-spinner"></span>
                      저장 중...
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
                    ) {
                      return;
                    }
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

export default MyPageEdit;