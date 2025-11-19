package com.debate.dto.response;

import com.debate.entity.Category;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 카테고리 응답 DTO
 * 카테고리 정보와 토론 개수를 포함합니다.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {
    private Long id;
    private String name;
    private String description;
    private Integer orderNum;
    private Long debateCount;  // 해당 카테고리의 토론 개수 (숨김 처리되지 않은 토론만)
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Category 엔티티와 토론 개수로부터 CategoryResponse 생성
     * 
     * @param category 카테고리 엔티티
     * @param debateCount 토론 개수
     * @return CategoryResponse 인스턴스
     */
    public static CategoryResponse from(Category category, Long debateCount) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .orderNum(category.getOrderNum())
                .debateCount(debateCount != null ? debateCount : 0L)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}

