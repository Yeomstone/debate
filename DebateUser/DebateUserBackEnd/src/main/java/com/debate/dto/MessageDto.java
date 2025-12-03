package com.debate.dto;

import com.debate.entity.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageDto {
    private Long id;
    private Long senderId;
    private String senderNickname;
    private String senderProfileImage;
    private Long receiverId;
    private String receiverNickname;
    private String content;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public static MessageDto from(Message message) {
        return MessageDto.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderNickname(message.getSender().getNickname())
                .senderProfileImage(message.getSender().getProfileImage())
                .receiverId(message.getReceiver().getId())
                .receiverNickname(message.getReceiver().getNickname())
                .content(message.getContent())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
