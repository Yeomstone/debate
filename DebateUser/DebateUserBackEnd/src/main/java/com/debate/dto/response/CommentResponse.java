package com.debate.dto.response;

import com.debate.entity.Comment;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private Long userId;
    private String nickname;
    private Long debateId;
    private Long parentId;
    private String content;
    private Boolean isHidden;
    private List<CommentResponse> replies;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static CommentResponse from(Comment comment) {
        return CommentResponse.builder()
                .id(comment.getId())
                .userId(comment.getUser().getId())
                .nickname(comment.getUser().getNickname())
                .debateId(comment.getDebate().getId())
                .parentId(comment.getParent() != null ? comment.getParent().getId() : null)
                .content(comment.getContent())
                .isHidden(comment.getIsHidden())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .build();
    }
}

