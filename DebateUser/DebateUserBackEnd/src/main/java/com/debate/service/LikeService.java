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

    @Transactional
    public void toggleLike(Long debateId, Long userId) {
        Debate debate = debateRepository.findById(debateId)
                .orElseThrow(() -> new ResourceNotFoundException("토론을 찾을 수 없습니다"));

        User user = new User();
        user.setId(userId);

        likeRepository.findByDebateAndUser(debate, user)
                .ifPresentOrElse(
                        likeRepository::delete,
                        () -> {
                            Like like = Like.builder()
                                    .debate(debate)
                                    .user(user)
                                    .build();
                            likeRepository.save(like);
                        }
                );
    }

    public boolean isLiked(Long debateId, Long userId) {
        Debate debate = new Debate();
        debate.setId(debateId);
        User user = new User();
        user.setId(userId);
        return likeRepository.existsByDebateAndUser(debate, user);
    }
}

