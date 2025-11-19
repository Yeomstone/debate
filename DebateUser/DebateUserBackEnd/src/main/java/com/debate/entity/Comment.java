package com.debate.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 댓글 엔티티
 * 토론에 대한 댓글을 저장하는 테이블 (대댓글 지원)
 */
@Entity
@Table(name = "comments", indexes = {
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_debate_id", columnList = "debate_id"),
    @Index(name = "idx_parent_id", columnList = "parent_id"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@org.hibernate.annotations.Comment("댓글 테이블")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Comment {
    /**
     * 댓글 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @org.hibernate.annotations.Comment("댓글 ID")
    private Long id;

    /**
     * 댓글 작성자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_comment_user"))
    @org.hibernate.annotations.Comment("댓글 작성자 ID")
    private User user;

    /**
     * 토론
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "debate_id", nullable = false, foreignKey = @ForeignKey(name = "fk_comment_debate"))
    @org.hibernate.annotations.Comment("토론 ID")
    private Debate debate;

    /**
     * 부모 댓글 (대댓글인 경우)
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", foreignKey = @ForeignKey(name = "fk_comment_parent"))
    @org.hibernate.annotations.Comment("부모 댓글 ID (대댓글인 경우)")
    private Comment parent;

    /**
     * 댓글 내용
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    @org.hibernate.annotations.Comment("댓글 내용")
    private String content;

    /**
     * 숨김 여부
     */
    @Column(name = "is_hidden", nullable = false)
    @org.hibernate.annotations.Comment("숨김 여부")
    @Builder.Default
    private Boolean isHidden = false;

    /**
     * 생성 일시
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    @org.hibernate.annotations.Comment("생성 일시")
    private LocalDateTime createdAt;

    /**
     * 수정 일시
     */
    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    @org.hibernate.annotations.Comment("수정 일시")
    private LocalDateTime updatedAt;
}

