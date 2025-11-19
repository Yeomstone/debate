package com.debate.dto.response;

import com.debate.entity.User;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String email;
    private String nickname;
    private String profileImage;
    private String bio;
    private User.UserStatus status;
    private Boolean emailVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 통계 정보
    private Long debateCount;           // 작성한 토론 수
    private Long commentCount;        // 작성한 댓글 수
    private Long likeCount;           // 받은 좋아요 수
    private Long participatedCount;   // 참여한 토론 수 (입장 선택한 토론)

    public static UserResponse from(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImage(user.getProfileImage())
                .bio(user.getBio())
                .status(user.getStatus())
                .emailVerified(user.getEmailVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
    
    public static UserResponse from(User user, Long debateCount, Long commentCount, Long likeCount, Long participatedCount) {
        return UserResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .nickname(user.getNickname())
                .profileImage(user.getProfileImage())
                .bio(user.getBio())
                .status(user.getStatus())
                .emailVerified(user.getEmailVerified())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .debateCount(debateCount)
                .commentCount(commentCount)
                .likeCount(likeCount)
                .participatedCount(participatedCount)
                .build();
    }
}

