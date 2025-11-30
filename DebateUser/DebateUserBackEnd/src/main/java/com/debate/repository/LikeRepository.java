package com.debate.repository;

import com.debate.entity.Debate;
import com.debate.entity.Like;
import com.debate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LikeRepository extends JpaRepository<Like, Long> {
    Optional<Like> findByDebateAndUser(Debate debate, User user);
    boolean existsByDebateAndUser(Debate debate, User user);
    
    // JPQL을 사용한 명시적 쿼리
    @org.springframework.data.jpa.repository.Query("SELECT l FROM Like l WHERE l.debate.id = :debateId AND l.user.id = :userId")
    Optional<Like> findByDebateIdAndUserId(@org.springframework.data.repository.query.Param("debateId") Long debateId, @org.springframework.data.repository.query.Param("userId") Long userId);

    @org.springframework.data.jpa.repository.Query("SELECT COUNT(l) > 0 FROM Like l WHERE l.debate.id = :debateId AND l.user.id = :userId")
    boolean existsByDebateIdAndUserId(@org.springframework.data.repository.query.Param("debateId") Long debateId, @org.springframework.data.repository.query.Param("userId") Long userId);
    
    long countByDebate(Debate debate);
}

