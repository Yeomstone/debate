package com.debate.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 채팅 메시지 엔티티
 * 토론에 대한 실시간 채팅 메시지를 저장하는 테이블
 */
@Entity
@Table(name = "chat_messages", indexes = {
    @Index(name = "idx_debate_id", columnList = "debate_id"),
    @Index(name = "idx_user_id", columnList = "user_id"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Comment("채팅 메시지 테이블")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class ChatMessage {
    /**
     * 채팅 메시지 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("채팅 메시지 ID")
    private Long id;

    /**
     * 토론
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "debate_id", nullable = false, foreignKey = @ForeignKey(name = "fk_chat_debate"))
    @Comment("토론 ID")
    private Debate debate;

    /**
     * 메시지 작성자
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, foreignKey = @ForeignKey(name = "fk_chat_user"))
    @Comment("메시지 작성자 ID")
    private User user;

    /**
     * 메시지 내용
     */
    @Column(nullable = false, columnDefinition = "TEXT")
    @Comment("메시지 내용")
    private String message;

    /**
     * 생성 일시
     */
    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    @Comment("생성 일시")
    private LocalDateTime createdAt;
}

