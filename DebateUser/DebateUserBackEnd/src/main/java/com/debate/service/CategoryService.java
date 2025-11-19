package com.debate.service;

import com.debate.dto.response.CategoryResponse;
import com.debate.entity.Category;
import com.debate.exception.ResourceNotFoundException;
import com.debate.repository.DebateRepository;
import com.debate.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;
    private final DebateRepository debateRepository;

    /**
     * 전체 카테고리 목록 조회 (토론 개수 포함)
     * 
     * @return 카테고리 목록 (토론 개수 포함)
     */
    public List<CategoryResponse> getAllCategories() {
        List<Category> categories = categoryRepository.findAllByOrderByOrderNumAsc();
        
        return categories.stream()
                .map(category -> {
                    // 해당 카테고리의 토론 개수 조회 (숨김 처리되지 않은 토론만)
                    long debateCount = debateRepository.findByCategoryAndIsHiddenFalse(
                            category, 
                            Pageable.unpaged()
                    ).getTotalElements();
                    
                    return CategoryResponse.from(category, debateCount);
                })
                .collect(Collectors.toList());
    }

    /**
     * 카테고리 ID로 카테고리 상세 정보 조회 (토론 개수 포함)
     * 
     * @param id 카테고리 ID
     * @return 카테고리 정보 (토론 개수 포함)
     * @throws ResourceNotFoundException 카테고리를 찾을 수 없는 경우
     */
    public CategoryResponse getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("카테고리를 찾을 수 없습니다"));
        
        // 해당 카테고리의 토론 개수 조회 (숨김 처리되지 않은 토론만)
        long debateCount = debateRepository.findByCategoryAndIsHiddenFalse(
                category, 
                Pageable.unpaged()
        ).getTotalElements();
        
        return CategoryResponse.from(category, debateCount);
    }
}

