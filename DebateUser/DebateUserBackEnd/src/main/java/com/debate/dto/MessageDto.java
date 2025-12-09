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

    /**
     * 프로필 이미지 URL 경로 변환
     * 기존 /files/editor/images/ 경로를 /files/user/profile/ 경로로 변환
     */
    private static String normalizeProfileImageUrl(String profileImage) {
        if (profileImage == null || profileImage.isEmpty()) {
            return profileImage;
        }
        // 기존 경로를 새 경로로 변환
        if (profileImage.startsWith("/files/editor/images/")) {
            return profileImage.replace("/files/editor/images/", "/files/user/profile/");
        }
        return profileImage;
    }

    public static MessageDto from(Message message) {
        return MessageDto.builder()
                .id(message.getId())
                .senderId(message.getSender().getId())
                .senderNickname(message.getSender().getNickname())
                .senderProfileImage(normalizeProfileImageUrl(message.getSender().getProfileImage()))
                .receiverId(message.getReceiver().getId())
                .receiverNickname(message.getReceiver().getNickname())
                .content(message.getContent())
                .isRead(message.getIsRead())
                .createdAt(message.getCreatedAt())
                .build();
    }
}
