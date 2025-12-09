package com.debate.repository;

import com.debate.entity.Debate;
import com.debate.entity.Comment;
import com.debate.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByDebateAndIsHiddenFalseAndParentIsNull(Debate debate, Pageable pageable);

    List<Comment> findByParent(Comment parent);

    List<Comment> findByUser(User user);

    Page<Comment> findByUserAndIsHiddenFalse(User user, Pageable pageable);

    long countByDebateAndIsHiddenFalse(Debate debate);
}
