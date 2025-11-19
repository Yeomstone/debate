package com.debate.service;

import com.debate.dto.response.UserResponse;
import com.debate.entity.User;
import com.debate.exception.ResourceNotFoundException;
import com.debate.repository.DebateOpinionRepository;
import com.debate.repository.DebateRepository;
import com.debate.repository.CommentRepository;
import com.debate.repository.LikeRepository;
import com.debate.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final DebateRepository debateRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final DebateOpinionRepository debateOpinionRepository;

    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다"));
        
        // 통계 정보 계산
        long debateCount = debateRepository.findByUserAndIsHiddenFalse(user, Pageable.unpaged()).getTotalElements();
        long commentCount = commentRepository.findByUser(user).size();
        
        // 받은 좋아요 수: 사용자가 작성한 토론들에 받은 좋아요 총합
        long likeCount = debateRepository.findByUserAndIsHiddenFalse(user, Pageable.unpaged())
                .getContent()
                .stream()
                .mapToLong(debate -> likeRepository.countByDebate(debate))
                .sum();
        
        // 참여한 토론 수: 입장을 선택한 토론 수
        long participatedCount = debateOpinionRepository.findByUser(user).size();
        
        return UserResponse.from(user, debateCount, commentCount, likeCount, participatedCount);
    }

    @Transactional
    public UserResponse updateProfile(Long userId, String nickname, String bio, String profileImage) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다"));

        if (nickname != null && !nickname.isEmpty()) {
            user.setNickname(nickname);
        }
        if (bio != null) {
            user.setBio(bio);
        }
        if (profileImage != null) {
            user.setProfileImage(profileImage);
        }

        user = userRepository.save(user);
        return UserResponse.from(user);
    }

    public User getUserEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("사용자를 찾을 수 없습니다"));
    }
}

