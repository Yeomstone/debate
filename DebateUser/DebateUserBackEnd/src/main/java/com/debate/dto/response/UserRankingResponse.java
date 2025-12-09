package com.debate.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 사용자 랭킹 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRankingResponse {
    private Long userId;              // 사용자 ID
    private String nickname;          // 닉네임
    private String profileImage;      // 프로필 이미지 URL
    private Long totalLikes;          // 받은 총 좋아요 수
    private Long debateCount;         // 작성한 토론 수
    private Long rank;                // 순위

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

    public UserRankingResponse(com.debate.entity.User user, Long score) {
        this.userId = user.getId();
        this.nickname = user.getNickname();
        this.profileImage = normalizeProfileImageUrl(user.getProfileImage());
        this.totalLikes = score;
        this.debateCount = 0L;
        this.rank = 0L;
    }
}