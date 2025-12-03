package com.debate.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 쪽지 엔티티
 * 사용자 간의 쪽지 정보를 저장하는 테이블
 */
@Entity
@Table(name = "messages", indexes = {
    @Index(name = "idx_sender", columnList = "sender_id"),
    @Index(name = "idx_receiver", columnList = "receiver_id"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Comment("쪽지 정보 테이블")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class Message {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("쪽지 ID")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    @Comment("보낸 사람")
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiver_id", nullable = false)
    @Comment("받는 사람")
    private User receiver;

    @Column(nullable = false, columnDefinition = "TEXT")
    @Comment("쪽지 내용")
    private String content;

    @Column(name = "is_read", nullable = false)
    @Comment("읽음 여부")
    @Builder.Default
    private Boolean isRead = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    @Comment("보낸 일시")
    private LocalDateTime createdAt;
}
