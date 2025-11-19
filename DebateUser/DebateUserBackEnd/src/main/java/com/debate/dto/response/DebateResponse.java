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

    public static DebateResponse from(Debate debate, Long likeCount, Long commentCount) {
        return DebateResponse.builder()
                .id(debate.getId())
                .userId(debate.getUser().getId())
                .nickname(debate.getUser().getNickname())
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

