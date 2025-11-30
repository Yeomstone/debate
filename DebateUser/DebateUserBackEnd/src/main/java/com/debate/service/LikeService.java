package com.debate.service;

import com.debate.entity.Debate;
import com.debate.entity.Like;
import com.debate.entity.User;
import com.debate.exception.ResourceNotFoundException;
import com.debate.repository.DebateRepository;
import com.debate.repository.LikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LikeService {
    private final LikeRepository likeRepository;
    private final DebateRepository debateRepository;
    private final com.debate.repository.UserRepository userRepository;

    @Transactional
    public void toggleLike(Long debateId, Long userId) {
        likeRepository.findByDebateIdAndUserId(debateId, userId)
                .ifPresentOrElse(
                        likeRepository::delete,
                        () -> {
                            Debate debate = debateRepository.getReferenceById(debateId);
                            User user = userRepository.getReferenceById(userId);
                            
                            Like like = Like.builder()
                                    .debate(debate)
                                    .user(user)
                                    .build();
                            likeRepository.save(like);
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

