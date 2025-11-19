package com.debate.controller;

import com.debate.dto.request.CreateOpinionRequest;
import com.debate.dto.response.ApiResponse;
import com.debate.entity.DebateOpinion;
import com.debate.service.DebateOpinionService;
import com.debate.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/opinions")
@RequiredArgsConstructor
public class OpinionController {
    private final DebateOpinionService debateOpinionService;
    private final SecurityUtil securityUtil;

    @PostMapping
    public ResponseEntity<ApiResponse<DebateOpinion>> createOpinion(
            @Valid @RequestBody CreateOpinionRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("인증이 필요합니다"));
        }
        
        DebateOpinion response = debateOpinionService.createOpinion(request, userId);
        return ResponseEntity.ok(ApiResponse.success("입장이 선택되었습니다", response));
    }

    @GetMapping("/debate/{debateId}")
    public ResponseEntity<ApiResponse<List<DebateOpinion>>> getOpinionsByDebate(@PathVariable Long debateId) {
        List<DebateOpinion> opinions = debateOpinionService.getOpinionsByDebate(debateId);
        return ResponseEntity.ok(ApiResponse.success(opinions));
    }
}

