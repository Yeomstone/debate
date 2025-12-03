package com.debate.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data

public class UpdateCommentRequest {
    @NotBlank(message = "내용은 비어 있을 수 없습니다.")
    private String content;
}
