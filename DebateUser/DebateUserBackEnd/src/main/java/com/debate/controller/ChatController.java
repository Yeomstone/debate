package com.debate.controller;

import com.debate.dto.ChatMessageDTO;
import com.debate.dto.response.ApiResponse;
import com.debate.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 채팅 컨트롤러
 * WebSocket 메시지 처리 및 REST API 제공
 */
@RestController
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;

    /**
     * WebSocket 메시지 핸들러
     * 클라이언트에서 /app/chat/{debateId}로 메시지 전송
     * /topic/debate/{debateId} 구독자에게 브로드캐스트
     * 
     * @param debateId 토론 ID
     * @param messageDTO 채팅 메시지
     * @return 저장된 메시지 (브로드캐스트)
     */
    @MessageMapping("/chat/{debateId}")
    @SendTo("/topic/debate/{debateId}")
    public ChatMessageDTO sendMessage(
            @DestinationVariable Long debateId,
            @Payload ChatMessageDTO messageDTO,
            SimpMessageHeaderAccessor headerAccessor) {
        
        log.info("채팅 메시지 수신 - 토론: {}, 사용자: {}, 메시지: {}", 
                debateId, messageDTO.getUserId(), messageDTO.getMessage());

        // 메시지 타입에 따른 처리
        if (messageDTO.getType() == ChatMessageDTO.MessageType.JOIN) {
            // 입장 메시지는 저장하지 않고 브로드캐스트만
            return ChatMessageDTO.builder()
                    .debateId(debateId)
                    .userId(messageDTO.getUserId())
                    .nickname(messageDTO.getNickname())
                    .message(messageDTO.getNickname() + "님이 입장했습니다.")
                    .type(ChatMessageDTO.MessageType.JOIN)
                    .build();
        } else if (messageDTO.getType() == ChatMessageDTO.MessageType.LEAVE) {
            // 퇴장 메시지
            return ChatMessageDTO.builder()
                    .debateId(debateId)
                    .userId(messageDTO.getUserId())
                    .nickname(messageDTO.getNickname())
                    .message(messageDTO.getNickname() + "님이 퇴장했습니다.")
                    .type(ChatMessageDTO.MessageType.LEAVE)
                    .build();
        }

        // 일반 채팅 메시지 저장 및 반환
        try {
            ChatMessageDTO savedMessage = chatService.saveMessage(
                    debateId,
                    messageDTO.getUserId(),
                    messageDTO.getMessage()
            );
            return savedMessage;
        } catch (Exception e) {
            log.error("메시지 저장 실패", e);
            // 에러가 발생해도 메시지는 브로드캐스트
            return messageDTO;
        }
    }

    /**
     * 이전 채팅 메시지 조회 (REST API)
     * 채팅방 입장 시 이전 메시지 로드에 사용
     * 
     * @param debateId 토론 ID
     * @param limit 조회할 메시지 수 (기본 50개)
     * @return 메시지 목록
     */
    @GetMapping("/api/chat/{debateId}")
    public ResponseEntity<ApiResponse<List<ChatMessageDTO>>> getMessages(
            @PathVariable Long debateId,
                @RequestParam(defaultValue = "50") int limit) {
        
        log.info("채팅 메시지 조회 - 토론: {}, limit: {}", debateId, limit);
        
        List<ChatMessageDTO> messages = chatService.getRecentMessages(debateId, limit);
        
        return ResponseEntity.ok(ApiResponse.<List<ChatMessageDTO>>builder()
                .success(true)
                .message("채팅 메시지 조회 성공")
                .data(messages)
                .build());
    }
}
