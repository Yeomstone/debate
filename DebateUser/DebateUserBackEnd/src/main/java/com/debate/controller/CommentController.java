package com.debate.controller;

import com.debate.dto.request.CreateCommentRequest;
import com.debate.dto.response.ApiResponse;
import com.debate.dto.response.CommentResponse;
import com.debate.service.CommentService;
import com.debate.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;
    private final SecurityUtil securityUtil;

    @PostMapping
    public ResponseEntity<ApiResponse<CommentResponse>> createComment(
            @Valid @RequestBody CreateCommentRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("인증이 필요합니다"));
        }
        
        CommentResponse response = commentService.createComment(request, userId);
        return ResponseEntity.ok(ApiResponse.success("댓글이 작성되었습니다", response));
    }

    @GetMapping("/debate/{debateId}")
    public ResponseEntity<ApiResponse<Page<CommentResponse>>> getCommentsByDebate(
            @PathVariable Long debateId,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<CommentResponse> response = commentService.getCommentsByDebate(debateId, pageable);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteComment(@PathVariable Long id) {
        Long userId = securityUtil.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("인증이 필요합니다"));
        }
        
        commentService.deleteComment(id, userId);
        return ResponseEntity.ok(ApiResponse.success("댓글이 삭제되었습니다", null));
    }
}

