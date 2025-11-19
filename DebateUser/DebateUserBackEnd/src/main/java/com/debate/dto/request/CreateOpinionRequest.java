package com.debate.dto.request;

import com.debate.entity.DebateOpinion.OpinionSide;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateOpinionRequest {
    @NotNull(message = "토론 ID는 필수입니다")
    private Long debateId;

    @NotNull(message = "입장은 필수입니다")
    private OpinionSide side;

    private String content; // 선택사항
}

