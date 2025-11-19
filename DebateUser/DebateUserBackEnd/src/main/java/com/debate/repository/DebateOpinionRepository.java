package com.debate.repository;

import com.debate.entity.Debate;
import com.debate.entity.DebateOpinion;
import com.debate.entity.DebateOpinion.OpinionSide;
import com.debate.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DebateOpinionRepository extends JpaRepository<DebateOpinion, Long> {
    Optional<DebateOpinion> findByDebateAndUser(Debate debate, User user);
    boolean existsByDebateAndUser(Debate debate, User user);
    List<DebateOpinion> findByDebate(Debate debate);
    List<DebateOpinion> findByDebateAndSide(Debate debate, OpinionSide side);
    long countByDebateAndSide(Debate debate, OpinionSide side);
    List<DebateOpinion> findByUser(User user);
}

