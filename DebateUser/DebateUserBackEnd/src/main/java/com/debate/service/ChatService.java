package com.debate.service;

import com.debate.dto.ChatMessageDTO;
import com.debate.entity.ChatMessage;
import com.debate.entity.Debate;
import com.debate.entity.User;
import com.debate.repository.ChatMessageRepository;
import com.debate.repository.DebateRepository;
import com.debate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 채팅 서비스
 * 채팅 메시지 저장 및 조회 기능 제공
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatMessageRepository chatMessageRepository;
    private final DebateRepository debateRepository;
    private final UserRepository userRepository;

    /**
     * 채팅 메시지 저장
     * 
     * @param debateId 토론 ID
     * @param userId 사용자 ID
     * @param message 메시지 내용
     * @return 저장된 메시지 DTO
     */
    @Transactional
    public ChatMessageDTO saveMessage(Long debateId, Long userId, String message) {
        Debate debate = debateRepository.findById(debateId)
                .orElseThrow(() -> new IllegalArgumentException("토론을 찾을 수 없습니다: " + debateId));
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + userId));

        ChatMessage chatMessage = ChatMessage.builder()
                .debate(debate)
                .user(user)
                .message(message)
                .build();

        ChatMessage saved = chatMessageRepository.save(chatMessage);
        
        return toDTO(saved, user);
    }

    /**
     * 최근 채팅 메시지 조회 (페이징)
     * 
     * @param debateId 토론 ID
     * @param limit 조회할 메시지 수 (기본 50개)
     * @return 메시지 DTO 리스트 (오래된 순으로 정렬)
     */
    @Transactional(readOnly = true)
    public List<ChatMessageDTO> getRecentMessages(Long debateId, int limit) {
        Debate debate = debateRepository.findById(debateId)
                .orElseThrow(() -> new IllegalArgumentException("토론을 찾을 수 없습니다: " + debateId));

        // 최신 메시지부터 limit개 조회
        List<ChatMessage> messages = chatMessageRepository
                .findByDebateOrderByCreatedAtDesc(debate, PageRequest.of(0, limit))
                .getContent();

        // 시간순 정렬 (오래된 것 먼저)
        Collections.reverse(messages);

        return messages.stream()
                .map(msg -> toDTO(msg, msg.getUser()))
                .collect(Collectors.toList());
    }

    /**
     * 프로필 이미지 URL 경로 변환
     * 기존 /files/editor/images/ 경로를 /files/user/profile/ 경로로 변환
     */
    private String normalizeProfileImageUrl(String profileImage) {
        if (profileImage == null || profileImage.isEmpty()) {
            return profileImage;
        }
        // 기존 경로를 새 경로로 변환
        if (profileImage.startsWith("/files/editor/images/")) {
            return profileImage.replace("/files/editor/images/", "/files/user/profile/");
        }
        return profileImage;
    }

    /**
     * Entity를 DTO로 변환
     */
    private ChatMessageDTO toDTO(ChatMessage chatMessage, User user) {
        return ChatMessageDTO.builder()
                .id(chatMessage.getId())
                .debateId(chatMessage.getDebate().getId())
                .userId(user.getId())
                .nickname(user.getNickname())
                .profileImage(normalizeProfileImageUrl(user.getProfileImage()))
                .message(chatMessage.getMessage())
                .createdAt(chatMessage.getCreatedAt())
                .type(ChatMessageDTO.MessageType.CHAT)
                .build();
    }
}
