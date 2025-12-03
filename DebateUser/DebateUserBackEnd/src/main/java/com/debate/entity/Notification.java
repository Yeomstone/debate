package com.debate.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // 알림 받는 사람

    @Column(nullable = false)
    private String content; // 알림 내용

    @Column(nullable = false)
    private String type; // 알림 타입 (COMMENT, LIKE, MESSAGE, SYSTEM)

    @Column(name = "related_url")
    private String relatedUrl; // 클릭 시 이동할 URL

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean isRead = false; // 읽음 여부

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
