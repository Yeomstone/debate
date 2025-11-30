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

    public UserRankingResponse(com.debate.entity.User user, Long score) {
        this.userId = user.getId();
        this.nickname = user.getNickname();
        this.profileImage = user.getProfileImage();
        this.totalLikes = score;
        this.debateCount = 0L;
        this.rank = 0L;
    }
}