package com.debate.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

/**
 * 토론(Debate) 엔티티
 * 사용자들이 토론할 토론 주제를 저장하는 테이블
 */
@Entity
@Table(name = "debate", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_category_id", columnList = "category_id"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_start_date", columnList = "start_date"),
    @Index(name = "idx_end_date", columnList = "end_date"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Comment("토론 주제 테이블")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Debate {
    /**
     * 토론 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("토론 ID")
    private Long id;

    /**
     * 토론 작성자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_debate_user"))
    @Comment("토론 작성자 ID")
    private User user;

    /**
     * 카테고리
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false, foreignKey = @ForeignKey(name = "fk_debate_category"))
    @Comment("카테고리 ID")
    private Category category;

    /**
     * 토론 제목
     */
    @Column(nullable = false, length = 255)
    @Comment("토론 제목")
    private String title;

    /**
     * 토론 내용
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    @Comment("토론 내용")
    private String content;

    /**
     * 토론 시작 일시
     */
    @Column(name = "start_date", nullable = false)
    @Comment("토론 시작 일시")
    private LocalDateTime startDate;

    /**
     * 토론 종료 일시
     */
    @Column(name = "end_date", nullable = false)
    @Comment("토론 종료 일시")
    private LocalDateTime endDate;

    /**
     * 토론 상태 (SCHEDULED: 예정, ACTIVE: 진행중, ENDED: 종료)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Comment("토론 상태 (SCHEDULED: 예정, ACTIVE: 진행중, ENDED: 종료)")
    @Builder.Default
    private DebateStatus status = DebateStatus.SCHEDULED;

    /**
     * 숨김 여부
     */
    @Column(name = "is_hidden", nullable = false)
    @Comment("숨김 여부")
    @Builder.Default
    private Boolean isHidden = false;

    /**
     * 조회수
     */
    @Column(name = "view_count", nullable = false)
    @Comment("조회수")
    @Builder.Default
    private Integer viewCount = 0;

    /**
     * 생성 일시
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    @Comment("생성 일시")
    private LocalDateTime createdAt;

    /**
     * 수정 일시
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    @Comment("수정 일시")
    private LocalDateTime updatedAt;

    /**
     * 토론 상태 열거형
     */
    public enum DebateStatus {
        SCHEDULED, // 예정
        ACTIVE,    // 진행중
        ENDED      // 종료
    }
}

