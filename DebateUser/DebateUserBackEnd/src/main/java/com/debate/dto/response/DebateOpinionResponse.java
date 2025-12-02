package com.debate.dto.response;

import com.debate.entity.DebateOpinion;
import com.debate.entity.DebateOpinion.OpinionSide;
import com.debate.entity.Debate.DebateStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class DebateOpinionResponse {
    private Long id;
    private Long debateId;
    private Long userId;
    private OpinionSide side;
    private String content;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // 토론 정보
    private String debateTitle;
    private DebateStatus debateStatus;
    private String categoryName;

    public static DebateOpinionResponse from(DebateOpinion opinion) {
        return DebateOpinionResponse.builder()
                .id(opinion.getId())
                .debateId(opinion.getDebate().getId())
                .userId(opinion.getUser().getId())
                .side(opinion.getSide())
                .content(opinion.getContent())
                .createdAt(opinion.getCreatedAt())
                .updatedAt(opinion.getUpdatedAt())
                // 토론 정보 추가
                .debateTitle(opinion.getDebate().getTitle())
                .debateStatus(opinion.getDebate().getStatus())
                .categoryName(opinion.getDebate().getCategory() != null 
                    ? opinion.getDebate().getCategory().getName() 
                    : null)
                .build();
    }
}
