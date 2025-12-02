package com.debate.service;

import com.debate.dto.MessageDto;
import com.debate.entity.Message;
import com.debate.entity.User;
import com.debate.repository.MessageRepository;
import com.debate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    // 쪽지 보내기
    @Transactional
    public MessageDto sendMessage(Long senderId, String receiverNickname, String content) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("보내는 사람을 찾을 수 없습니다."));
        
        User receiver = userRepository.findByNickname(receiverNickname)
                .orElseThrow(() -> new IllegalArgumentException("받는 사람을 찾을 수 없습니다."));

        if (sender.getId().equals(receiver.getId())) {
            throw new IllegalArgumentException("자신에게는 쪽지를 보낼 수 없습니다.");
        }

        Message message = Message.builder()
                .sender(sender)
                .receiver(receiver)
                .content(content)
                .isRead(false)
                .build();

        Message savedMessage = messageRepository.save(message);

        // 알림 생성 로직
        try {
            notificationService.createNotification(
                    receiver,
                    sender.getNickname() + "님이 쪽지를 보냈습니다.",
                    "MESSAGE",
                    "/my?tab=messages"
            );
        } catch (Exception e) {
            System.err.println("알림 생성 실패: " + e.getMessage());
        }

        return MessageDto.from(savedMessage);
    }

    // 받은 쪽지 목록
    public Page<MessageDto> getReceivedMessages(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        return messageRepository.findByReceiverOrderByCreatedAtDesc(user, pageable)
                .map(MessageDto::from);
    }

    // 보낸 쪽지 목록
    public Page<MessageDto> getSentMessages(Long userId, Pageable pageable) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        return messageRepository.findBySenderOrderByCreatedAtDesc(user, pageable)
                .map(MessageDto::from);
    }

    // 쪽지 읽음 처리
    @Transactional
    public MessageDto readMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("쪽지를 찾을 수 없습니다."));

        if (!message.getReceiver().getId().equals(userId)) {
            throw new IllegalArgumentException("본인의 쪽지만 읽을 수 있습니다.");
        }

        if (!message.getIsRead()) {
            message.setIsRead(true);
        }

        return MessageDto.from(message);
    }

    // 쪽지 삭제
    @Transactional
    public void deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("쪽지를 찾을 수 없습니다."));

        if (!message.getReceiver().getId().equals(userId) && !message.getSender().getId().equals(userId)) {
            throw new IllegalArgumentException("본인의 쪽지만 삭제할 수 있습니다.");
        }

        messageRepository.delete(message);
    }

    // 안 읽은 쪽지 개수
    public long getUnreadCount(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));
        
        return messageRepository.countByReceiverAndIsReadFalse(user);
    }
}
