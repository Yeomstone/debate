package com.debate.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 좋아요 엔티티
 * 사용자가 토론에 좋아요를 누른 정보를 저장하는 테이블
 */
@Entity
@Table(name = "likes", indexes = {
    @Index(name = "idx_debate_id", columnList = "debate_id"),
    @Index(name = "idx_user_id", columnList = "user_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "uk_debate_user", columnNames = {"debate_id", "user_id"})
})
@Comment("좋아요 테이블")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Like {
    /**
     * 좋아요 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("좋아요 ID")
    private Long id;

    /**
     * 토론
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "debate_id", nullable = false, foreignKey = @ForeignKey(name = "fk_like_debate"))
    @Comment("토론 ID")
    private Debate debate;

    /**
     * 사용자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_like_user"))
    @Comment("사용자 ID")
    private User user;

    /**
     * 생성 일시
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    @Comment("생성 일시")
    private LocalDateTime createdAt;
}

