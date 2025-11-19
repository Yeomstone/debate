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
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("인증이 필요합니다"));
        }
        
        boolean isLiked = likeService.isLiked(debateId, userId);
        return ResponseEntity.ok(ApiResponse.success(isLiked));
    }
}

