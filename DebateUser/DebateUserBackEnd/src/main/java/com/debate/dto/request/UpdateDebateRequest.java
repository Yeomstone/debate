package com.debate.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 토론 수정 요청 DTO
 * 
 * 토론 수정 시 사용되는 요청 데이터입니다.
 * 모든 필드는 선택적(optional)입니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDebateRequest {
    @Size(min = 1, max = 200, message = "제목은 1자 이상 200자 이하여야 합니다")
    private String title;              // 토론 제목 (선택적)

    private String content;            // 토론 내용 (선택적)

    private Long categoryId;           // 카테고리 ID (선택적)

    private LocalDateTime startDate;   // 시작일시 (선택적)

    private LocalDateTime endDate;     // 종료일시 (선택적)
}

