package com.debate.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 사용자 엔티티
 * 토론 플랫폼의 사용자 정보를 저장하는 테이블
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_email", columnList = "email"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_created_at", columnList = "created_at")
})
@Comment("사용자 정보 테이블")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EntityListeners(AuditingEntityListener.class)
public class User {
    /**
     * 사용자 ID (PK)
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("사용자 ID")
    private Long id;

    /**
     * 이메일 주소 (로그인 ID로 사용)
     */
    @Column(nullable = false, unique = true, length = 255)
    @Comment("이메일 주소 (로그인 ID)")
    private String email;

    /**
     * 비밀번호 (BCrypt 해시)
     */
    @Column(nullable = false, length = 255)
    @Comment("비밀번호 (BCrypt 해시)")
    private String password;

    /**
     * 닉네임
     */
    @Column(nullable = false, length = 50)
    @Comment("닉네임")
    private String nickname;

    /**
     * 프로필 이미지 URL
     */
    @Column(name = "profile_image", length = 500)
    @Comment("프로필 이미지 URL")
    private String profileImage;

    /**
     * 자기소개
     */
    @Column(columnDefinition = "TEXT")
    @Comment("자기소개")
    private String bio;

    /**
     * 사용자 상태 (ACTIVE: 활성, SUSPENDED: 정지, DELETED: 삭제)
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Comment("사용자 상태 (ACTIVE: 활성, SUSPENDED: 정지, DELETED: 삭제)")
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    /**
     * 이메일 인증 여부
     */
    @Column(name = "email_verified", nullable = false)
    @Comment("이메일 인증 여부")
    @Builder.Default
    private Boolean emailVerified = false;

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
     * 사용자 상태 열거형
     */
    public enum UserStatus {
        ACTIVE,    // 활성
        SUSPENDED, // 정지
        DELETED    // 삭제
    }
}

