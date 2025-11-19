package com.debate.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CreateDebateRequest {
    @NotNull(message = "카테고리는 필수입니다")
    private Long categoryId;

    @NotBlank(message = "제목은 필수입니다")
    private String title;

    @NotBlank(message = "내용은 필수입니다")
    private String content;

    @NotNull(message = "시작일시는 필수입니다")
    private LocalDateTime startDate;

    @NotNull(message = "종료일시는 필수입니다")
    private LocalDateTime endDate;
}

