package com.debate.entity;

import com.fasterxml.jackson.annotation.JsonGetter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Comment;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

/**
 * 토론 플랫폼 서비스 이용자의 기본 정보를 저장하는 엔티티.
 * <p>
 * 이메일과 사용자명은 고유해야 하며, 상태/이메일 인증 여부/프로필 및 자기소개 등의 메타데이터를 함께 관리한다.
 * {@link AuditingEntityListener}를 통해 생성·수정 일시가 자동 기록된다.
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
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Comment("사용자 ID")
    private Long id;

    @Column(nullable = false, unique = true, length = 255)
    @Comment("이메일 주소 (로그인 ID)")
    private String email;

    @Column(nullable = false, length = 255)
    @Comment("비밀번호 (BCrypt 해시)")
    @JsonIgnore
    private String password;

    @Column(nullable = false, length = 50)
    @Comment("닉네임")
    private String nickname;

    @Column(name = "profile_image", length = 500)
    @Comment("프로필 이미지 URL")
    private String profileImage;

    /**
     * 프로필 이미지 URL 경로 변환 (JSON 직렬화 시)
     * 기존 /files/editor/images/ 경로를 /files/user/profile/ 경로로 변환
     */
    @JsonGetter("profileImage")
    public String getProfileImageForJson() {
        if (profileImage == null || profileImage.isEmpty()) {
            return profileImage;
        }
        // 기존 경로를 새 경로로 변환
        if (profileImage.startsWith("/files/editor/images/")) {
            return profileImage.replace("/files/editor/images/", "/files/user/profile/");
        }
        return profileImage;
    }

    @Column(columnDefinition = "TEXT")
    @Comment("자기소개")
    private String bio;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Comment("사용자 상태 (ACTIVE: 활성, SUSPENDED: 정지, DELETED: 삭제)")
    @Builder.Default
    private UserStatus status = UserStatus.ACTIVE;

    @Column(name = "email_verified", nullable = false)
    @Comment("이메일 인증 여부")
    @Builder.Default
    private Boolean emailVerified = false;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    @Comment("생성 일시")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    @Comment("수정 일시")
    private LocalDateTime updatedAt;

    public enum UserStatus {
        ACTIVE,    // 활성
        SUSPENDED, // 정지
        DELETED    // 삭제
    }
}

