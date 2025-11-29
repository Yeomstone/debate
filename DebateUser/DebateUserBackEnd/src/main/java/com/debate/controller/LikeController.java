package com.debate.controller;

import com.debate.dto.response.ApiResponse;
import com.debate.service.LikeService;
import com.debate.util.SecurityUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
@RequiredArgsConstructor
public class LikeController {
    private final LikeService likeService;
    private final SecurityUtil securityUtil;

    @PostMapping("/debate/{debateId}")
    public ResponseEntity<ApiResponse<Object>> toggleLike(@PathVariable Long debateId) {
        Long userId = securityUtil.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("인증이 필요합니다"));
        }

        likeService.toggleLike(debateId, userId);
        return ResponseEntity.ok(ApiResponse.success("좋아요가 처리되었습니다", null));
    }

    @GetMapping("/debate/{debateId}")
    public ResponseEntity<ApiResponse<Boolean>> isLiked(@PathVariable Long debateId) {
        Long userId = securityUtil.getCurrentUserId();
        System.out.println("isLiked Check - DebateID: " + debateId + ", UserID: " + userId);
        
        // [수정] 비로그인 사용자(토큰 만료 등)는 401 에러 대신 false 반환
        // 이를 통해 상세 페이지 진입 시 강제 로그아웃을 방지합니다.
        if (userId == null) {
            return ResponseEntity.ok(ApiResponse.success(false));
        }

        boolean isLiked = likeService.isLiked(debateId, userId);
        System.out.println("isLiked Result: " + isLiked);
        return ResponseEntity.ok(ApiResponse.success(isLiked));
    }
}