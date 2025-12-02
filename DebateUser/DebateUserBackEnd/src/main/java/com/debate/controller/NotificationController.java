package com.debate.controller;

import com.debate.entity.User;
import com.debate.service.NotificationService;
import com.debate.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService; // UserService 추가

    // 알림 목록 및 안 읽은 개수 조회
    @GetMapping
    public ResponseEntity<Map<String, Object>> getNotifications(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        // [수정] 이메일로 사용자 찾기 -> ID 추출
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(notificationService.getMyNotifications(user.getId()));
    }

    // 안 읽은 알림 개수만 조회 (폴링용)
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        // [수정] 이메일로 사용자 찾기 -> ID 추출
        User user = userService.getUserByEmail(userDetails.getUsername());
        long count = notificationService.getUnreadCount(user.getId());
        return ResponseEntity.ok(Map.of("count", count));
    }

    // 알림 읽음 처리
    @PostMapping("/{id}/read")
    public ResponseEntity<Void> readNotification(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        // [수정] 이메일로 사용자 찾기 -> ID 추출
        User user = userService.getUserByEmail(userDetails.getUsername());
        notificationService.readNotification(id, user.getId());
        return ResponseEntity.ok().build();
    }
}