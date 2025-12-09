package com.debate.controller;

import com.debate.dto.response.ApiResponse;
import com.debate.entity.Debate;
import com.debate.service.AdminDebateService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

/**
 * 관리자 콘솔에서 토론(Debate) 데이터를 관리하기 위한 REST 컨트롤러.
 * <p>
 * 페이징 목록 조회, 상세 조회, 내용/기간 수정, 상태 전환, 숨김 토글, 삭제 등 운영에 필요한 액션을 제공한다.
 */
@Tag(name = "관리자 토론 관리 API", description = "토론 조회, 수정, 삭제, 숨김 처리 등 토론 관리 API")
@RestController
@RequestMapping("/api/admin/debate")
@RequiredArgsConstructor
public class AdminDebateController {
    private final AdminDebateService adminDebateService;

    /**
     * 조건을 지정해 토론 목록을 페이지 단위로 조회한다.
     *
     * @param keyword   제목/내용 검색 키워드
     * @param status    토론 상태(SCHEDULED/ACTIVE/ENDED)
     * @param isHidden  숨김 여부 필터
     * @param page      페이지 번호(0-base)
     * @param size      페이지 크기
     * @return 조건에 맞는 토론 페이지 wrapped ApiResponse
     */
    @Operation(summary = "토론 목록 조회", description = "검색 조건에 따라 토론 목록을 조회합니다. 최신 순으로 정렬됩니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<Debate>>> getDebates(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Debate.DebateStatus status,
            @RequestParam(required = false) Boolean isHidden,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        // 최신 순으로 정렬 (createdAt 내림차순)
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Debate> debates = adminDebateService.searchDebates(keyword, status, isHidden, pageable);
        return ResponseEntity.ok(ApiResponse.success(debates));
    }

    /**
     * 특정 토론의 상세 정보를 조회한다.
     *
     * @param id 토론 ID
     * @return 토론 엔티티 wrapped ApiResponse
     */
    @Operation(summary = "토론 상세 조회", description = "토론의 상세 정보를 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Debate>> getDebateDetail(@PathVariable Long id) {
        Debate debate = adminDebateService.getDebateById(id);
        return ResponseEntity.ok(ApiResponse.success(debate));
    }

    /**
     * 토론 제목/내용/시작일/종료일을 선택적으로 갱신한다.
     *
     * @param id        토론 ID
     * @param title     변경할 제목
     * @param content   변경할 본문
     * @param startDate 변경할 시작 시각
     * @param endDate   변경할 종료 시각
     * @return 수정된 토론 엔티티 wrapped ApiResponse
     */
    @Operation(summary = "토론 수정", description = "토론 정보를 수정합니다.")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Debate>> updateDebate(
            @PathVariable Long id,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String content,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        Debate debate = adminDebateService.updateDebate(id, title, content, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success("토론이 수정되었습니다", debate));
    }

    /**
     * 토론의 진행 상태를 변경한다.
     *
     * @param id     토론 ID
     * @param status 설정할 상태 값
     * @return 변경된 토론 엔티티 wrapped ApiResponse
     */
    @Operation(summary = "토론 상태 변경", description = "토론의 상태를 변경합니다.")
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Debate>> updateDebateStatus(
            @PathVariable Long id,
            @RequestParam Debate.DebateStatus status) {
        Debate debate = adminDebateService.updateDebateStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("토론 상태가 변경되었습니다", debate));
    }

    /**
     * 토론의 숨김 플래그를 토글한다.
     *
     * @param id 토론 ID
     * @return 토글된 토론 엔티티 wrapped ApiResponse
     */
    @Operation(summary = "토론 숨김 처리", description = "토론의 숨김 상태를 토글합니다.")
    @PutMapping("/{id}/toggle-hidden")
    public ResponseEntity<ApiResponse<Debate>> toggleDebateHidden(@PathVariable Long id) {
        Debate debate = adminDebateService.toggleDebateHidden(id);
        return ResponseEntity.ok(ApiResponse.success("토론 숨김 상태가 변경되었습니다", debate));
    }

    /**
     * 토론을 영구 삭제한다.
     *
     * @param id 토론 ID
     * @return 성공 메시지 응답
     */
    @Operation(summary = "토론 삭제", description = "토론을 삭제합니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteDebate(@PathVariable Long id) {
        adminDebateService.deleteDebate(id);
        return ResponseEntity.ok(ApiResponse.success("토론이 삭제되었습니다", null));
    }
}

