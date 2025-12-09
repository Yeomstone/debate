package com.debate.dto.response;

import com.debate.entity.Comment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 댓글 응답 DTO
 * 관리자 사이트에서 댓글 정보를 표시하기 위한 DTO입니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private Long userId;
    private String nickname;
    private String profileImage;
    private Long debateId;
    private Long parentId;
    private String content;
    private Boolean isHidden;
    private Boolean isDeleted;
    private List<CommentResponse> replies;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int likeCount;
    private boolean liked;

    /**
     * Comment 엔티티를 CommentResponse로 변환합니다.
     * 대댓글(replies)은 포함하지 않습니다. 서비스에서 별도로 설정해야 합니다.
     *
     * @param comment 댓글 엔티티
     * @return CommentResponse
     */
    public static CommentResponse from(Comment comment) {
        boolean deleted = comment.getIsDeleted() != null && comment.getIsDeleted();

        return CommentResponse.builder()
                .id(comment.getId())
                .userId(deleted ? null : comment.getUser().getId())
                .nickname(deleted ? "(삭제)" : comment.getUser().getNickname())
                .profileImage(deleted ? null : comment.getUser().getProfileImage())
                .debateId(comment.getDebate().getId())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .content(deleted ? "삭제된 댓글입니다." : comment.getContent())
                .isHidden(comment.getIsHidden())
                .isDeleted(deleted)
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .likeCount(comment.getLikeCount())
                .liked(false) // 관리자 사이트에서는 좋아요 상태를 확인하지 않음
                .build();
    }
}

