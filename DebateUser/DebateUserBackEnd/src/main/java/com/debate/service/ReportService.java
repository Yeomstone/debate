package com.debate.service;

import com.debate.dto.request.CreateReportRequest;
import com.debate.entity.Report;
import com.debate.entity.User;
import com.debate.exception.BadRequestException;
import com.debate.repository.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {
    private final ReportRepository reportRepository;

    @Transactional
    public Report createReport(CreateReportRequest request, Long reporterId) {
        User reporter = new User();
        reporter.setId(reporterId);

        // 중복 신고 체크
        if (reportRepository.findByReporterAndTargetTypeAndTargetId(
                reporter, request.getTargetType(), request.getTargetId()).isPresent()) {
            throw new BadRequestException("이미 신고한 대상입니다");
        }

        Report report = Report.builder()
                .reporter(reporter)
                .targetType(request.getTargetType())
                .targetId(request.getTargetId())
                .reason(request.getReason())
                .description(request.getDescription())
                .status(Report.ReportStatus.PENDING)
                .build();

        return reportRepository.save(report);
    }
}

