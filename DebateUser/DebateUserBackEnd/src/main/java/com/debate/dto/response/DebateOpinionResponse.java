package com.debate.dto.response;

import com.debate.entity.DebateOpinion;
import com.debate.entity.DebateOpinion.OpinionSide;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    public static DebateOpinionResponse from(DebateOpinion opinion) {
        return DebateOpinionResponse.builder()
                .id(opinion.getId())
                .debateId(opinion.getDebate().getId())
                .userId(opinion.getUser().getId())
                .side(opinion.getSide())
                .content(opinion.getContent())
                .build();
    }
}
