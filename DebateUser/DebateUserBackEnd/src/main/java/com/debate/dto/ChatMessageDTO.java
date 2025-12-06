package com.debate.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * 채팅 메시지 DTO
 * WebSocket을 통한 메시지 송수신에 사용
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageDTO {
    
    /**
     * 메시지 ID (응답 시)
     */
    private Long id;
    
    /**
     * 토론 ID
     */
    private Long debateId;
    
    /**
     * 사용자 ID
     */
    private Long userId;
    
    /**
     * 사용자 닉네임
     */
    private String nickname;
    
    /**
     * 프로필 이미지 URL
     */
    private String profileImage;
    
    /**
     * 메시지 내용
     */
    private String message;
    
    /**
     * 메시지 생성 시간
     */
    private LocalDateTime createdAt;
    
    /**
     * 메시지 타입 (CHAT, JOIN, LEAVE 등)
     */
    private MessageType type;
    
    public enum MessageType {
        CHAT,   // 일반 채팅 메시지
        JOIN,   // 채팅방 입장
        LEAVE   // 채팅방 퇴장
    }
}
