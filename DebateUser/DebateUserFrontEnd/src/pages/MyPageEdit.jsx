/**
 * MyPageEdit 컴포넌트
 *
 * 마이페이지 프로필 수정 페이지입니다.
 *
 * 주요 기능:
 * - 닉네임 수정
 * - 자기소개 수정
 * - 프로필 이미지 업로드 (향후 구현)
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import "./MyPageEdit.css";

const MyPageEdit = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 상태 관리
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nickname: "",
    bio: "",
    profileImage: "",
  });
  const [errors, setErrors] = useState({});

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
      setFormData({
        nickname: data.nickname || "",
        bio: data.bio || "",
        profileImage: data.profileImage || "",
      });
    } catch (error) {
      console.error("프로필 로딩 실패:", error);
    } finally {
      setLoading(false);
    }
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
    // 에러 초기화
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
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
      return;
    }

    setSaving(true);
    try {
      await userService.updateProfile(
        formData.nickname || null,
        formData.bio || null,
        formData.profileImage || null
      );
      alert("프로필이 수정되었습니다.");
      navigate("/my");
    } catch (error) {
      console.error("프로필 수정 실패:", error);
      alert("프로필 수정에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  /**
   * 프로필 이미지 업로드 핸들러 (향후 구현)
   */
  const handleImageUpload = (e) => {
    // TODO: 이미지 업로드 기능 구현
    const file = e.target.files[0];
    if (file) {
      // 이미지 미리보기 및 업로드 로직
      console.log("이미지 업로드:", file);
    }
  };

  if (loading) {
    return <div className="container">로딩 중...</div>;
  }

  return (
    <div className="my-page-edit">
      <div className="container">
        <div className="my-page-layout">
          {/* 사이드바 */}
          <aside className="my-page-sidebar">
            <div className="profile-card">
              <div className="profile-avatar-large">
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
                <h3>프로필 사진</h3>
                <div className="profile-photo-section">
                  <div className="profile-photo-preview">
                    <div className="profile-avatar-large">
                      {formData.profileImage ? (
                        <img src={formData.profileImage} alt="프로필" />
                      ) : (
                        <span>👤</span>
                      )}
                    </div>
                  </div>
                  <div className="profile-photo-actions">
                    <label htmlFor="profile-photo" className="btn btn-outline">
                      사진 업로드
                    </label>
                    <input
                      type="file"
                      id="profile-photo"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, profileImage: "" }))
                      }
                    >
                      기본 이미지로 변경
                    </button>
                  </div>
                  <p className="form-help">
                    JPG, PNG 형식만 지원됩니다. 최대 5MB
                  </p>
                </div>
              </div>

              {/* 닉네임 */}
              <div className="form-section">
                <label htmlFor="nickname" className="form-label">
                  닉네임
                </label>
                <input
                  type="text"
                  id="nickname"
                  name="nickname"
                  className={`form-input ${errors.nickname ? "error" : ""}`}
                  value={formData.nickname}
                  onChange={handleChange}
                  placeholder="닉네임을 입력하세요"
                />
                {errors.nickname && (
                  <p className="form-error">{errors.nickname}</p>
                )}
                <p className="form-help">2-20자 사이의 닉네임을 입력하세요.</p>
              </div>

              {/* 소개 */}
              <div className="form-section">
                <label htmlFor="bio" className="form-label">
                  소개
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  className={`form-textarea ${errors.bio ? "error" : ""}`}
                  rows="4"
                  value={formData.bio}
                  onChange={handleChange}
                  maxLength={200} /* [수정] 200자 입력 제한 설정 */
                  placeholder="자기소개를 입력하세요"
                />

                {/* [수정] 글자 수 카운터 및 에러 메시지 영역 분리 */}
                <div className="textarea-footer">
                  {errors.bio ? (
                    <span className="form-error">{errors.bio}</span>
                  ) : (
                    <span></span> /* 에러 없을 때 공간 유지용 (선택 사항) */
                  )}
                  <span className="character-count">
                    {formData.bio.length} / 200자
                  </span>
                </div>

                <p className="form-help">
                  자신을 표현하는 한마디를 적어주세요.
                </p>
              </div>

              {/* 저장 버튼 */}
              <div className="form-actions">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                >
                  {saving ? "저장 중..." : "저장하기"}
                </button>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => navigate("/my")}
                >
                  취소
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyPageEdit;
