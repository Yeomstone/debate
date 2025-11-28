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

import com.debate.dto.response.DebateOpinionResponse;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/opinions")
@RequiredArgsConstructor
public class OpinionController {
    private final DebateOpinionService debateOpinionService;
    private final SecurityUtil securityUtil;

    @PostMapping
    public ResponseEntity<ApiResponse<DebateOpinionResponse>> createOpinion(
            @Valid @RequestBody CreateOpinionRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("인증이 필요합니다"));
        }
        
        DebateOpinion opinion = debateOpinionService.createOpinion(request, userId);
        return ResponseEntity.ok(ApiResponse.success("입장이 선택되었습니다", DebateOpinionResponse.from(opinion)));
    }

    @GetMapping("/debate/{debateId}")
    public ResponseEntity<ApiResponse<List<DebateOpinionResponse>>> getOpinionsByDebate(@PathVariable Long debateId) {
        List<DebateOpinion> opinions = debateOpinionService.getOpinionsByDebate(debateId);
        List<DebateOpinionResponse> response = opinions.stream()
                .map(DebateOpinionResponse::from)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}

