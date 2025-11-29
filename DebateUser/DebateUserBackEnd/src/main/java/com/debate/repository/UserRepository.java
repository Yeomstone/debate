package com.debate.repository;

import com.debate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {//debate 테이블 담당 레파짓토리
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    // [추가] 닉네임 중복 확인용 메서드
    boolean existsByNickname(String nickname);

    // [추가] 랭킹 쿼리
    // 1. 토론 좋아요 순
    @org.springframework.data.jpa.repository.Query("SELECT new com.debate.dto.response.UserRankingResponse(d.user, COUNT(l)) " +
           "FROM Like l JOIN l.debate d " +
           "WHERE l.createdAt BETWEEN :start AND :end " +
           "GROUP BY d.user " +
           "ORDER BY COUNT(l) DESC")
    java.util.List<com.debate.dto.response.UserRankingResponse> findRankingByDebateLikes(@org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start, @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end, org.springframework.data.domain.Pageable pageable);

    // 2. 토론 의견(투표) 순
    @org.springframework.data.jpa.repository.Query("SELECT new com.debate.dto.response.UserRankingResponse(d.user, COUNT(o)) " +
           "FROM DebateOpinion o JOIN o.debate d " +
           "WHERE o.createdAt BETWEEN :start AND :end " +
           "GROUP BY d.user " +
           "ORDER BY COUNT(o) DESC")
    java.util.List<com.debate.dto.response.UserRankingResponse> findRankingByDebateOpinions(@org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start, @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end, org.springframework.data.domain.Pageable pageable);

    // 3. 댓글 좋아요 순
    @org.springframework.data.jpa.repository.Query("SELECT new com.debate.dto.response.UserRankingResponse(c.user, COUNT(cl)) " +
           "FROM CommentLike cl JOIN cl.comment c " +
           "WHERE cl.createdAt BETWEEN :start AND :end " +
           "GROUP BY c.user " +
           "ORDER BY COUNT(cl) DESC")
    java.util.List<com.debate.dto.response.UserRankingResponse> findRankingByCommentLikes(@org.springframework.data.repository.query.Param("start") java.time.LocalDateTime start, @org.springframework.data.repository.query.Param("end") java.time.LocalDateTime end, org.springframework.data.domain.Pageable pageable);

}

