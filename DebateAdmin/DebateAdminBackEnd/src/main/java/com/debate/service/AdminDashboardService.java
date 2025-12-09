package com.debate.service;

import com.debate.dto.response.DashboardStatsResponse;
import com.debate.entity.Debate;
import com.debate.entity.Report;
import com.debate.entity.User;
import com.debate.repository.DebateRepository;
import com.debate.repository.CommentRepository;
import com.debate.repository.ReportRepository;
import com.debate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 관리자 대시보드를 위한 통계 및 하이라이트 데이터를 제공하는 서비스.
 * <p>
 * 회원/토론/댓글/신고와 관련된 집계, 최근 활동 목록을 조회한다.
 */
@Service
@RequiredArgsConstructor
public class AdminDashboardService {
    private final UserRepository userRepository;
    private final DebateRepository debateRepository;
    private final ReportRepository reportRepository;
    private final CommentRepository commentRepository;

    /**
     * 대시보드에 표시할 핵심 지표를 계산한다.
     * <p>
     * 현재는 전체 데이터를 메모리에 로드해 필터링하므로 데이터가 많을 경우 성능 최적화가 필요하다.
     *
     * @return 대시보드 통계 DTO
     */
    public DashboardStatsResponse getDashboardStats() {
        LocalDate today = LocalDate.now();
        LocalDateTime startOfToday = today.atStartOfDay();
        LocalDateTime endOfToday = today.plusDays(1).atStartOfDay();

        long totalUsers = userRepository.count();
        long totalDebates = debateRepository.count();
        long activeDebates = debateRepository.countByStatus(Debate.DebateStatus.ACTIVE);
        long pendingReports = reportRepository.countByStatus(Report.ReportStatus.PENDING);
        
        long todayNewUsers = userRepository.findAll().stream()
                .filter(user -> user.getCreatedAt() != null && 
                        user.getCreatedAt().isAfter(startOfToday) && 
                        user.getCreatedAt().isBefore(endOfToday))
                .count();
        
        long todayNewDebates = debateRepository.findAll().stream()
                .filter(debate -> debate.getCreatedAt() != null && 
                        debate.getCreatedAt().isAfter(startOfToday) && 
                        debate.getCreatedAt().isBefore(endOfToday))
                .count();

        long totalComments = commentRepository.count();

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalDebates(totalDebates)
                .totalComments(totalComments)
                .activeDebates(activeDebates)
                .pendingReports(pendingReports)
                .todayNewUsers(todayNewUsers)
                .todayNewDebates(todayNewDebates)
                .build();
    }

    /**
     * 최근 가입한 회원 목록을 조회한다.
     *
     * @param limit 조회할 최대 인원수
     * @return 회원 목록 (최신순 정렬)
     */
    public List<User> getRecentUsers(int limit) {
        // 최신순으로 정렬 (createdAt 내림차순)
        return userRepository.findAll(PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "createdAt")))
                .getContent();
    }

    /**
     * 조회수가 높은 토론을 조회한다.
     *
     * @param limit 조회 상위 개수
     * @return 인기 토론 목록
     */
    public List<Debate> getTopDebates(int limit) {
        return debateRepository.findTopByOrderByViewCountDesc(PageRequest.of(0, limit));
    }

    /**
     * 처리 대기 중인 신고 목록을 조회한다.
     *
     * @param limit 조회할 신고 수
     * @return 미처리 신고 목록
     */
    public List<Report> getPendingReports(int limit) {
        return reportRepository.findByStatus(Report.ReportStatus.PENDING, PageRequest.of(0, limit))
                .getContent();
    }
}

