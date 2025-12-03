package com.debate.repository;

import com.debate.entity.Notification;
import com.debate.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    // 사용자의 알림 목록 조회 (최신순)
    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    // 안 읽은 알림 개수 조회
    long countByUserAndIsReadFalse(User user);

    // 특정 사용자의 모든 알림 읽음 처리 (필요 시 사용)
    // @Modifying
    // @Query("UPDATE Notification n SET n.isRead = true WHERE n.user = :user")
    // void markAllAsRead(@Param("user") User user);
}
