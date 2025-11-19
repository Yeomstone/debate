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
    long countByDebate(Debate debate);
}

