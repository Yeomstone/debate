package com.debate.controller;

import com.debate.dto.response.ApiResponse;
import com.debate.dto.response.UserDetailResponse;
import com.debate.entity.User;
import com.debate.service.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * 관리자 회원 운영 기능을 담당하는 컨트롤러.
 * <p>
 * 회원 검색, 상세 조회, 상태 변경, 삭제 등 운영 액션을 노출한다.
 */
@Tag(name = "관리자 회원 관리 API", description = "회원 조회, 검색, 상태 변경 등 회원 관리 API")
@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {
    private final AdminUserService adminUserService;

    /**
     * 키워드, 상태 조건으로 회원을 페이지 조회한다.
     *
     * @param keyword 검색 키워드(이메일/닉네임 등)
     * @param status  회원 상태 필터
     * @param page    페이지 번호
     * @param size    페이지 크기
     * @return 회원 페이지 wrapped ApiResponse
     */
    @Operation(summary = "회원 목록 조회", description = "검색 조건에 따라 회원 목록을 조회합니다. 최신순으로 정렬됩니다.")
    @GetMapping
    public ResponseEntity<ApiResponse<Page<User>>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) User.UserStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        // 최신순으로 정렬 (createdAt 내림차순)
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> users = adminUserService.searchUsers(keyword, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(users));
    }

    /**
     * 단일 회원의 상세 정보 및 활동 지표를 조회한다.
     *
     * @param id 회원 ID
     * @return 회원 상세 DTO wrapped ApiResponse
     */
    @Operation(summary = "회원 상세 조회", description = "회원의 상세 정보를 조회합니다.")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserDetailResponse>> getUserDetail(@PathVariable Long id) {
        UserDetailResponse user = adminUserService.getUserDetail(id);
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    /**
     * 회원 상태를 변경한다.
     *
     * @param id     회원 ID
     * @param status 설정할 상태
     * @return 변경된 회원 엔티티 wrapped ApiResponse
     */
    @Operation(summary = "회원 상태 변경", description = "회원의 상태를 변경합니다 (ACTIVE, SUSPENDED, DELETED).")
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<User>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam User.UserStatus status) {
        User user = adminUserService.updateUserStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("회원 상태가 변경되었습니다", user));
    }

    /**
     * 회원을 삭제 상태로 전환한다.
     *
     * @param id 회원 ID
     * @return 성공 메시지 응답
     */
    @Operation(summary = "회원 삭제", description = "회원을 삭제 처리합니다.")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        adminUserService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.success("회원이 삭제되었습니다", null));
    }
}

