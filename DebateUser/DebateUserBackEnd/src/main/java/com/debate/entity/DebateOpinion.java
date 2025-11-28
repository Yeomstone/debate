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
 * 토론 의견 엔티티
 * 사용자가 토론에 대해 선택한 입장과 의견을 저장하는 테이블
 */
@Entity
@Table(name = "debate_opinion", indexes = {
    @Index(name = "idx_debate_id", columnList = "debate_id"),
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_side", columnList = "side")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_debate_user", columnNames = {"debate_id", "user_id"})
})
@Comment("토론 의견 테이블")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class DebateOpinion {
    /**
     * 의견 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("의견 ID")
    private Long id;

    /**
     * 토론
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "debate_id", nullable = false, foreignKey = @ForeignKey(name = "fk_opinion_debate"))
    @Comment("토론 ID")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Debate debate;

    /**
     * 사용자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_opinion_user"))
    @Comment("사용자 ID")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User user;

    /**
     * 입장 (FOR: 찬성, AGAINST: 반대, NEUTRAL: 중립, OTHER: 기타)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Comment("입장 (FOR: 찬성, AGAINST: 반대, NEUTRAL: 중립, OTHER: 기타)")
    private OpinionSide side;

    /**
     * 의견 내용
     */
    @Column(columnDefinition = "TEXT")
    @Comment("의견 내용")
    private String content;

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
     * 입장 열거형
     */
    public enum OpinionSide {
        FOR,      // 찬성
        AGAINST,  // 반대
        NEUTRAL,  // 중립
        OTHER     // 기타
    }
}

