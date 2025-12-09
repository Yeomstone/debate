package com.debate.dto.response;

import com.debate.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 관리자 화면에서 회원 상세 정보를 보여주기 위한 DTO.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailResponse {
    private Long id;
    private String email;
    private String nickname;
    private String profileImage;
    private String bio;
    private User.UserStatus status;
    private Boolean emailVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long debateCount;
    private Long commentCount;

    /**
     * 프로필 이미지 URL 경로 변환
     * 기존 /files/editor/images/ 경로를 /files/user/profile/ 경로로 변환
     */
    private static String normalizeProfileImageUrl(String profileImage) {
        if (profileImage == null || profileImage.isEmpty()) {
            return profileImage;
        }
        // 기존 경로를 새 경로로 변환
        if (profileImage.startsWith("/files/editor/images/")) {
            return profileImage.replace("/files/editor/images/", "/files/user/profile/");
        }
        return profileImage;
    }

    /**
     * 회원 엔티티와 활동 지표를 DTO로 변환한다.
     *
     * @param user         회원 엔티티
     * @param debateCount    공개 토론 수
     * @param commentCount 댓글 수
     * @return 회원 상세 DTO
     */
    public static UserDetailResponse from(User user, Long debateCount, Long commentCount) {
        return UserDetailResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImage(normalizeProfileImageUrl(user.getProfileImage()))
                .bio(user.getBio())
                .status(user.getStatus())
                .emailVerified(user.getEmailVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .debateCount(debateCount)
                .commentCount(commentCount)
                .build();
    }
}

