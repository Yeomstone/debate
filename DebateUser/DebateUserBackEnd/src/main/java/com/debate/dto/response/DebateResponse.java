package com.debate.dto.response;

import com.debate.entity.Debate;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DebateResponse {
    private Long id;
    private Long userId;
    private String nickname;
    private String profileImage; // 프로필 이미지 필드 추가
    private Long categoryId;
    private String categoryName;
    private String title;
    private String content;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Debate.DebateStatus status;
    private Boolean isHidden;
    private Integer viewCount;
    private Long likeCount;
    private Long commentCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

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

    public static DebateResponse from(Debate debate, Long likeCount, Long commentCount) {
        return DebateResponse.builder()
                .id(debate.getId())
                .userId(debate.getUser().getId())
                .nickname(debate.getUser().getNickname())
                .profileImage(normalizeProfileImageUrl(debate.getUser().getProfileImage())) // 프로필 이미지 추가
                .categoryId(debate.getCategory().getId())
                .categoryName(debate.getCategory().getName())
                .title(debate.getTitle())
                .content(debate.getContent())
                .startDate(debate.getStartDate())
                .endDate(debate.getEndDate())
                .status(debate.getStatus())
                .isHidden(debate.getIsHidden())
                .viewCount(debate.getViewCount())
                .likeCount(likeCount)
                .commentCount(commentCount)
                .createdAt(debate.getCreatedAt())
                .updatedAt(debate.getUpdatedAt())
                .build();
    }
}

