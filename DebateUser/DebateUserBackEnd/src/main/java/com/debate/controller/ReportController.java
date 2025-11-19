package com.debate.controller;

import com.debate.dto.request.CreateReportRequest;
import com.debate.dto.response.ApiResponse;
import com.debate.entity.Report;
import com.debate.service.ReportService;
import com.debate.util.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {
    private final ReportService reportService;
    private final SecurityUtil securityUtil;

    @PostMapping
    public ResponseEntity<ApiResponse<Report>> createReport(
            @Valid @RequestBody CreateReportRequest request) {
        Long userId = securityUtil.getCurrentUserId();
        if (userId == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("인증이 필요합니다"));
        }
        
        Report response = reportService.createReport(request, userId);
        return ResponseEntity.ok(ApiResponse.success("신고가 접수되었습니다", response));
    }
}

