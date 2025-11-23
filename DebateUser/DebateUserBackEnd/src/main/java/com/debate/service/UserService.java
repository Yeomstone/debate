package com.debate.service;

import com.debate.dto.response.UserRankingResponse;
import com.debate.dto.response.UserResponse;
import com.debate.entity.Debate;
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
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.Sort;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final DebateRepository debateRepository;
    private final CommentRepository commentRepository;
    private final LikeRepository likeRepository;
    private final DebateOpinionRepository debateOpinionRepository;

    /**
     * 받은 좋아요 수 기준 사용자 랭킹 조회
     *
     * @param limit 조회할 상위 사용자 수
     * @return 사용자 랭킹 목록
     */
    public List<UserRankingResponse> getUserRanking(int limit) {
        // 1. 모든 사용자의 받은 좋아요 수 계산
        List<User> users = userRepository.findAll();

        List<UserRankingResponse> ranking = new ArrayList<>();

        for (User user : users) {
            // 사용자가 작성한 토론 목록 조회
            List<Debate> debates = debateRepository.findByUserAndIsHiddenFalse(
                    user,
                    Sort.by(Sort.Direction.DESC, "createdAt")
            );

            // 토론들의 총 좋아요 수 계산
            long totalLikes = 0;
            for (Debate debate : debates) {
                totalLikes += likeRepository.countByDebate(debate);
            }

            // 좋아요가 1개 이상인 경우만 랭킹에 포함
            if (totalLikes > 0) {
                UserRankingResponse response = UserRankingResponse.builder()
                        .userId(user.getId())
                        .nickname(user.getNickname())
                        .profileImage(user.getProfileImage())
                        .totalLikes(totalLikes)
                        .debateCount((long) debates.size())
                        .build();
                ranking.add(response);
            }
        }

        // 2. 좋아요 수 기준 내림차순 정렬
        ranking.sort((a, b) -> Long.compare(b.getTotalLikes(), a.getTotalLikes()));

        // 3. 순위 부여
        for (int i = 0; i < ranking.size(); i++) {
            ranking.get(i).setRank((long) (i + 1));
        }

        // 4. 상위 N개만 반환
        return ranking.stream()
                .limit(limit)
                .collect(Collectors.toList());
    }
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

