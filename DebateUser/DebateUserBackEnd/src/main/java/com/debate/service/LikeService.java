package com.debate.service;

import com.debate.entity.Debate;
import com.debate.entity.Like;
import com.debate.entity.User;
import com.debate.exception.ResourceNotFoundException;
import com.debate.repository.DebateRepository;
import com.debate.repository.LikeRepository;
import com.debate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepository likeRepository;
    private final DebateRepository debateRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public void toggleLike(Long debateId, Long userId) {
        likeRepository.findByDebateIdAndUserId(debateId, userId)
                .ifPresentOrElse(
                        likeRepository::delete,
                        () -> {
                            Debate debate = debateRepository.findById(debateId)
                                    .orElseThrow(() -> new ResourceNotFoundException("토론을 찾을 수 없습니다"));
                            User user = userRepository.getReferenceById(userId);
                            
                            Like like = Like.builder()
                                    .debate(debate)
                                    .user(user)
                                    .build();
                            likeRepository.save(like);

                            // 알림 생성 로직 (본인이 아닐 경우)
                            if (!debate.getUser().getId().equals(userId)) {
                                try {
                                    notificationService.createNotification(
                                            debate.getUser(),
                                            user.getNickname() + "님이 회원님의 토론을 좋아합니다: " + debate.getTitle(),
                                            "LIKE",
                                            "/debate/" + debate.getId()
                                    );
                                } catch (Exception e) {
                                    System.err.println("알림 생성 실패: " + e.getMessage());
                                }
                            }
                        }
                );
    }

    public boolean isLiked(Long debateId, Long userId) {
        System.out.println("LikeService.isLiked - DebateID: " + debateId + ", UserID: " + userId);
        boolean exists = likeRepository.existsByDebateIdAndUserId(debateId, userId);
        System.out.println("LikeService.isLiked - Exists: " + exists);
        return exists;
    }
}

