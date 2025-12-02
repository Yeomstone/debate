package com.debate.controller;

import com.debate.dto.MessageDto;
import com.debate.entity.User;
import com.debate.service.MessageService;
import com.debate.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/messages")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;
    private final UserService userService;

    // 쪽지 보내기
    @PostMapping
    public ResponseEntity<MessageDto> sendMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody Map<String, String> request) {
        
        User user = userService.getUserByEmail(userDetails.getUsername());
        String receiverNickname = request.get("receiverNickname");
        String content = request.get("content");

        return ResponseEntity.ok(messageService.sendMessage(user.getId(), receiverNickname, content));
    }

    // 받은 쪽지 목록
    @GetMapping("/received")
    public ResponseEntity<Page<MessageDto>> getReceivedMessages(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(messageService.getReceivedMessages(user.getId(), pageable));
    }

    // 보낸 쪽지 목록
    @GetMapping("/sent")
    public ResponseEntity<Page<MessageDto>> getSentMessages(
            @AuthenticationPrincipal UserDetails userDetails,
            @PageableDefault(size = 10) Pageable pageable) {
        
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(messageService.getSentMessages(user.getId(), pageable));
    }

    // 쪽지 읽음 처리 (상세 조회)
    @GetMapping("/{id}")
    public ResponseEntity<MessageDto> readMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(messageService.readMessage(id, user.getId()));
    }

    // 쪽지 삭제
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMessage(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long id) {
        
        User user = userService.getUserByEmail(userDetails.getUsername());
        messageService.deleteMessage(id, user.getId());
        return ResponseEntity.ok().build();
    }

    // 안 읽은 쪽지 개수
    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userService.getUserByEmail(userDetails.getUsername());
        return ResponseEntity.ok(messageService.getUnreadCount(user.getId()));
    }
}
