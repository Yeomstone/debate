package com.debate.dto.request;

import com.debate.entity.Report.TargetType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CreateReportRequest {
    @NotNull(message = "신고 대상 타입은 필수입니다")
    private TargetType targetType;

    @NotNull(message = "신고 대상 ID는 필수입니다")
    private Long targetId;

    @NotBlank(message = "신고 사유는 필수입니다")
    private String reason;

    private String description;
}

