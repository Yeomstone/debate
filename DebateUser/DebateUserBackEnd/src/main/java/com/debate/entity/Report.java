package com.debate.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 신고 엔티티
 * 사용자들이 부적절한 콘텐츠를 신고하는 정보를 저장하는 테이블
 */
@Entity
@Table(name = "reports", indexes = {
    @Index(name = "idx_reporter_id", columnList = "reporter_id"),
    @Index(name = "idx_target", columnList = "target_type, target_id"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Comment("신고 테이블")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Report {
    /**
     * 신고 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("신고 ID")
    private Long id;

    /**
     * 신고자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false, foreignKey = @ForeignKey(name = "fk_report_reporter"))
    @Comment("신고자 ID")
    private User reporter;

    /**
     * 신고 대상 타입 (DEBATE: 토론, COMMENT: 댓글, USER: 사용자)
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "target_type", nullable = false, length = 20)
    @Comment("신고 대상 타입 (DEBATE: 토론, COMMENT: 댓글, USER: 사용자)")
    private TargetType targetType;

    /**
     * 신고 대상 ID
     */
    @Column(name = "target_id", nullable = false)
    @Comment("신고 대상 ID")
    private Long targetId;

    /**
     * 신고 사유
     */
    @Column(nullable = false, length = 255)
    @Comment("신고 사유")
    private String reason;

    /**
     * 신고 상세 설명
     */
    @Column(columnDefinition = "TEXT")
    @Comment("신고 상세 설명")
    private String description;

    /**
     * 신고 처리 상태 (PENDING: 대기중, APPROVED: 승인, REJECTED: 거부)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Comment("신고 처리 상태 (PENDING: 대기중, APPROVED: 승인, REJECTED: 거부)")
    @Builder.Default
    private ReportStatus status = ReportStatus.PENDING;

    /**
     * 처리한 관리자 ID
     */
    @Column(name = "processed_by")
    @Comment("처리한 관리자 ID")
    private Long processedBy;

    /**
     * 처리 일시
     */
    @Column(name = "processed_at")
    @Comment("처리 일시")
    private LocalDateTime processedAt;

    /**
     * 생성 일시
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    @Comment("생성 일시")
    private LocalDateTime createdAt;

    /**
     * 신고 대상 타입 열거형
     */
    public enum TargetType {
        DEBATE,   // 토론
        COMMENT,  // 댓글
        USER      // 사용자
    }

    /**
     * 신고 처리 상태 열거형
     */
    public enum ReportStatus {
        PENDING,  // 대기중
        APPROVED, // 승인
        REJECTED  // 거부
    }
}

