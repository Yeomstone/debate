package com.debate.controller;

import com.debate.dto.response.ApiResponse;
import com.debate.dto.response.UserResponse;
import com.debate.service.UserService;
import com.debate.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.debate.dto.response.UserRankingResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Tag(name = "사용자 API", description = "사용자 정보 조회 및 랭킹 API")

public class UserController {
    /**
     * 사용자 랭킹 조회 (받은 좋아요 수 기준)
     *
     * @param limit 조회할 상위 사용자 수 (기본값: 10)
     * @return 사용자 랭킹 목록
     */
    @Operation(summary = "사용자 랭킹 조회", description = "기간 및 기준별로 사용자 랭킹을 조회합니다.")
    @GetMapping("/ranking")
    public ResponseEntity<ApiResponse<List<UserRankingResponse>>> getUserRanking(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(defaultValue = "all") String period,
            @RequestParam(defaultValue = "likes") String criteria) {
        List<UserRankingResponse> ranking = userService.getUserRanking(period, criteria, limit);
        return ResponseEntity.ok(ApiResponse.success(ranking));
    }

    private final UserService userService;
    private final SecurityUtil securityUtil;

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        Long userId = securityUtil.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("인증이 필요합니다"));
        }

        UserResponse response = userService.getUserById(userId);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @RequestParam(required = false) String nickname,
            @RequestParam(required = false) String bio,
            @RequestParam(required = false) String profileImage) {
        Long userId = securityUtil.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("인증이 필요합니다"));
        }

        UserResponse response = userService.updateProfile(userId, nickname, bio, profileImage);
        return ResponseEntity.ok(ApiResponse.success("프로필이 수정되었습니다", response));
    }

    /**
     * 특정 사용자가 작성한 토론 목록 조회
     *
     * @param id       사용자 ID
     * @param pageable 페이징 정보
     * @return 사용자가 작성한 토론 목록
     */
    @Operation(summary = "사용자 작성 토론 조회", description = "특정 사용자가 작성한 토론 목록을 조회합니다.")
    @GetMapping("/{id}/debates")
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<com.debate.dto.response.DebateResponse>>> getUserDebates(
            @PathVariable Long id,
            @org.springframework.data.web.PageableDefault(size = 10, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) org.springframework.data.domain.Pageable pageable) {
        var response = userService.getUserDebates(id, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    /**
     * 특정 사용자가 작성한 댓글 목록 조회
     *
     * @param id       사용자 ID
     * @param pageable 페이징 정보
     * @return 사용자가 작성한 댓글 목록
     */
    @Operation(summary = "사용자 작성 댓글 조회", description = "특정 사용자가 작성한 댓글 목록을 조회합니다.")
    @GetMapping("/{id}/comments")
    public ResponseEntity<ApiResponse<org.springframework.data.domain.Page<com.debate.dto.response.CommentResponse>>> getUserComments(
            @PathVariable Long id,
            @org.springframework.data.web.PageableDefault(size = 10, sort = "createdAt", direction = org.springframework.data.domain.Sort.Direction.DESC) org.springframework.data.domain.Pageable pageable) {
        var response = userService.getUserComments(id, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
